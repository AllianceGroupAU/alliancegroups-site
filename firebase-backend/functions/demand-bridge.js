"use strict";

const crypto = require("crypto");

function normalizeService(value, isComplianceShield = false) {
  const text = String(value || "").trim().toLowerCase();
  if (isComplianceShield || text.includes("compliance")) return "inspection";
  if (text.includes("asbestos") || text.includes("hazard") || text.includes("hazmat")) return "asbestos_removal";
  if (text.includes("mould") || text.includes("mold")) return "mould_remediation";
  if (text.includes("roof") && (text.includes("replace") || text.includes("replacement"))) return "roof_replacement";
  if (text.includes("roof")) return "roof_repair";
  if (text.includes("storm") || text.includes("water ingress") || text.includes("emergency")) return "emergency_response";
  if (text.includes("remediation") || text.includes("building")) return "building_remediation";
  return "building_remediation";
}

function normalizeUrgency(value) {
  const text = String(value || "").trim().toLowerCase();
  if (text.includes("emergency")) return "emergency";
  if (text.includes("urgent") || text.includes("asap") || text.includes("today") || text.includes("active")) return "urgent";
  return "normal";
}

function buildDemandPayload(leadId, leadData) {
  const data = leadData || {};
  const isComplianceShield = !!data.isComplianceShield;
  return {
    client_name: String(data.company || data.name || "Website enquiry").trim(),
    contact_name: String(data.name || "").trim(),
    contact_email: String(data.email || "").trim(),
    contact_phone: String(data.phone || "").trim(),
    site_address: String(data.siteAddress || "Site Address Unspecified").trim(),
    site_suburb: "",
    site_postcode: "",
    service_type: normalizeService(data.service || data.documentType, isComplianceShield),
    description: String(data.message || "").trim(),
    urgency: normalizeUrgency(data.urgency),
    estimated_value: 0,
    raw_source: "website_firebase",
    source_type: "firebase_submit_lead",
    event_type: isComplianceShield ? "COMPLIANCE_SHIELD_INTAKE_RECEIVED" : "WEBSITE_ENQUIRY_RECEIVED",
    idempotency_key: "firebase:" + leadId,
    data_origin: "VERIFIED",
  };
}

function signDemandWebhook(bodyText, timestamp, secret) {
  if (!secret) throw new Error("Demand webhook secret is not configured");
  const digest = crypto
    .createHmac("sha256", secret)
    .update(String(timestamp) + "." + bodyText)
    .digest("hex");
  return "sha256=" + digest;
}


function buildRelayEnvelope(leadId, leadData, secret, timestamp = String(Math.floor(Date.now() / 1000))) {
  if (!secret) throw new Error("Demand webhook secret is not configured");
  const payload = buildDemandPayload(leadId, leadData);
  const payloadBody = JSON.stringify(payload);
  return {
    event_id: String(leadId),
    payload,
    payload_body: payloadBody,
    signature: signDemandWebhook(payloadBody, timestamp, secret),
    timestamp: String(timestamp),
    idempotency_key: payload.idempotency_key,
  };
}

function verifyRelayBearer(authorizationHeader, expectedKey) {
  const expected = String(expectedKey || "");
  const header = String(authorizationHeader || "");
  if (!expected || !header.startsWith("Bearer ")) return false;
  const supplied = header.slice(7);
  const expectedBuf = Buffer.from(expected, "utf8");
  const suppliedBuf = Buffer.from(supplied, "utf8");
  if (expectedBuf.length !== suppliedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, suppliedBuf);
}

async function forwardLeadToDemandEngine(payload, options = {}) {
  const url = String(options.url || "").trim();
  if (!url) return { status: "disabled", httpStatus: null };

  const secret = String(options.secret || "");
  if (!secret) {
    return { status: "failed", httpStatus: null, error: "Demand webhook secret is not configured" };
  }

  const fetchImpl = options.fetchImpl || global.fetch;
  if (typeof fetchImpl !== "function") {
    return { status: "failed", httpStatus: null, error: "Fetch implementation unavailable" };
  }

  const timestamp = String(options.timestamp || Date.now() / 1000);
  const body = JSON.stringify(payload);
  const timeoutMs = Number(options.timeoutMs || 1800);
  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

  try {
    const response = await fetchImpl(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Alliance-Signature": signDemandWebhook(body, timestamp, secret),
        "X-Alliance-Timestamp": timestamp,
        "X-Idempotency-Key": payload.idempotency_key,
      },
      body,
      ...(controller ? { signal: controller.signal } : {}),
    });

    let responseBody = {};
    try {
      responseBody = await response.json();
    } catch (_) {
      responseBody = {};
    }

    if (!response.ok) {
      return {
        status: "failed",
        httpStatus: response.status,
        error: responseBody.error || ("Demand Engine returned HTTP " + response.status),
      };
    }

    return {
      status: "delivered",
      httpStatus: response.status,
      leadRef: responseBody.ref || null,
      duplicate: !!responseBody.is_duplicate,
    };
  } catch (err) {
    return {
      status: "failed",
      httpStatus: null,
      error: err && err.message ? err.message : String(err),
    };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

module.exports = {
  buildDemandPayload,
  signDemandWebhook,
  forwardLeadToDemandEngine,
  buildRelayEnvelope,
  verifyRelayBearer,
};
