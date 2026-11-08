/**
 * Alliance Building & Hazmat Group — Firebase Cloud Functions v2
 * Production hardened: secret binding, CORS restriction, rate limiting,
 * server-side validation, upload token auth, finalization, email workflow.
 */

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret, defineString } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

if (!admin.apps.length) {
  admin.initializeApp();
}

// Convenience accessors
const db = () => getFirestore();
const storage = () => getStorage();

// ── Secrets (explicitly declared; accessible only within bound functions) ──
const smtpUser = defineSecret("SMTP_USER");
const smtpPass = defineSecret("SMTP_PASS");
const paypalClientId = defineSecret("PAYPAL_CLIENT_ID");
const paypalClientSecret = defineSecret("PAYPAL_CLIENT_SECRET");
const paypalWebhookId = defineSecret("PAYPAL_WEBHOOK_ID");
const paypalEnv = defineString("PAYPAL_ENV", { default: "sandbox" }); // "sandbox" or "live"

// ── Compliance Shield subscription: 3 tiers x 2 billing intervals ──────────
// All amounts are GST-inclusive AUD cents. Ex-GST price x 1.1, rounded.
const COMPLIANCE_SHIELD_PLANS = {
  silver: {
    label: "Silver",
    description: "Annual 48-hour desktop compliance review and renewal",
    month: 4345,   // $39.50 + GST
    year: 43450,   // $395 + GST
  },
  gold: {
    label: "Gold",
    description: "Annual compliance review, quarterly check-ins, and 24/7 emergency response for storm damage, roof leaks and other weather mishaps",
    month: 8745,   // $79.50 + GST
    year: 87450,   // $795 + GST
  },
  platinum: {
    label: "Platinum",
    description: "Annual compliance review, quarterly check-ins, priority-SLA 24/7 emergency response for storm damage, roof leaks and other weather mishaps, and a document vault",
    month: 16445,  // $149.50 + GST
    year: 164450,  // $1,495 + GST
  },
};
const SITE_ORIGIN = "https://www.alliancegroups.com.au";

// PayPal Billing Plan IDs — PayPal subscriptions must reference a pre-created
// Plan (unlike Stripe's inline price_data). Run scripts/setup-paypal-plans.js
// once per PayPal environment (sandbox, then live) and paste the printed IDs
// here before deploying. Requests for a tier/interval with no ID configured
// are rejected rather than silently mischarged.
const COMPLIANCE_SHIELD_PLAN_IDS = {
  silver: { month: null, year: null },
  gold: { month: null, year: null },
  platinum: { month: null, year: null },
};

function paypalApiBase() {
  return paypalEnv.value() === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

async function getPaypalAccessToken() {
  const res = await fetch(`${paypalApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${paypalClientId.value()}:${paypalClientSecret.value()}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`PayPal OAuth token request failed: ${JSON.stringify(data)}`);
  return data.access_token;
}

async function verifyPaypalWebhookSignature(req, accessToken) {
  const res = await fetch(`${paypalApiBase()}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transmission_id: req.headers["paypal-transmission-id"],
      transmission_time: req.headers["paypal-transmission-time"],
      cert_url: req.headers["paypal-cert-url"],
      auth_algo: req.headers["paypal-auth-algo"],
      transmission_sig: req.headers["paypal-transmission-sig"],
      webhook_id: paypalWebhookId.value(),
      webhook_event: req.body,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`PayPal webhook verification request failed: ${JSON.stringify(data)}`);
  return data.verification_status === "SUCCESS";
}

// ── Upload policy ──────────────────────────────────────────────────────────
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB — must match frontend
const MAX_DOCS_PER_SUBMISSION = 10;
const UPLOAD_SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour from lead creation
const SIGNED_URL_TTL_MS = 5 * 60 * 1000;      // 5 minutes

// Compliance Shield accepted types — must match HTML accept & user instructions
const COMPLIANCE_ALLOWED_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

// General enquiry forms do not upload files; list kept for reference
const ALLOWED_MIME_TYPES = COMPLIANCE_ALLOWED_MIME;

// ── Approved production origins ────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "https://www.alliancegroups.com.au",
  "https://alliancegroups.com.au",
];
// Add emulator/local origin only when running in the emulator
if (process.env.FUNCTIONS_EMULATOR === "true") {
  ALLOWED_ORIGINS.push("http://localhost:5000", "http://127.0.0.1:5000",
                       "http://localhost:8080", "http://127.0.0.1:8080");
}

// ── In-memory rate limiter ────────────────────────────────────────────────
// LIMITATION: This limiter is per Cloud Functions instance and resets on
// cold start. It is a lightweight first layer against naive burst abuse.
// It does NOT provide globally enforced, distributed rate limiting across
// all running instances. For distributed enforcement, integrate
// Cloud Armor, Firebase App Check, or a shared Firestore/Redis counter.
const requestCounts = new Map();
function rateLimit(ip, windowMs = 60_000, maxRequests = 20) {
  const now = Date.now();
  const entry = requestCounts.get(ip) || { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }
  entry.count++;
  requestCounts.set(ip, entry);
  return entry.count > maxRequests;
}

// ── CORS helper ────────────────────────────────────────────────────────────
function handleCors(req, res) {
  const origin = req.headers.origin || "";
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
  }
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return true; // preflight handled
  }
  return false;
}

// ── Input validators ───────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[\d\s()+\-]{7,20}$/;

function validateLead(body, isComplianceShield = false) {
  const errors = [];
  const { name, email, phone, service, documentType, siteAddress, message } = body;

  const trimStr = (v, max) => (typeof v === "string" ? v.trim().substring(0, max) : "");

  const tName = trimStr(name, 120);
  if (!tName || tName.length < 2) errors.push("Name is required (min 2 characters).");

  const tEmail = trimStr(email, 254);
  const tPhone = trimStr(phone, 20);
  if (!tEmail && !tPhone) errors.push("A valid email address or phone number is required.");
  if (tEmail && !EMAIL_RE.test(tEmail)) errors.push("Email address format is invalid.");
  if (tPhone && !PHONE_RE.test(tPhone)) errors.push("Phone number format is invalid.");

  const tService = trimStr(service, 120);
  const tDocType = trimStr(documentType, 120);
  if (isComplianceShield) {
    if (!tDocType) errors.push("Document/review type is required for Compliance Shield submissions.");
    const tAddr = trimStr(siteAddress, 300);
    if (!tAddr || tAddr.length < 5) errors.push("Property/site address is required.");
  } else {
    if (!tService && !tDocType) errors.push("Service or document type is required.");
  }

  const tMessage = trimStr(message, 2000);
  if (!tMessage || tMessage.length < 5) errors.push("A brief description is required (min 5 characters).");

  return errors;
}

// ── Upload token generator ─────────────────────────────────────────────────
function generateUploadToken() {
  return crypto.randomBytes(32).toString("hex");
}

// ── Nodemailer factory (uses bound secrets; call inside secret-bound function) ─
function makeTransport(user, pass) {
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// submitLead — General enquiry OR Compliance Shield intake
// ══════════════════════════════════════════════════════════════════════════════
exports.submitLead = onRequest(
  { secrets: [smtpUser, smtpPass], cors: false },
  async (req, res) => {
    if (handleCors(req, res)) return;
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "unknown";
    if (rateLimit(ip, 60_000, 15)) {
      return res.status(429).json({ error: "Too many requests. Please try again shortly." });
    }

    // Request size guard (~64 KB is plenty for form data)
    const bodyStr = JSON.stringify(req.body);
    if (bodyStr.length > 65536) {
      return res.status(413).json({ error: "Request body too large." });
    }

    const body = req.body || {};
    const isCS = !!body.documentType; // Compliance Shield submissions carry documentType

    // Honeypot: hidden field that browsers leave blank; bots fill it
    if (body._hp && String(body._hp).trim() !== "") {
      // Silently accept (don't reveal detection)
      return res.status(200).json({ success: true, message: "Received.", id: "noop" });
    }

    // Server-side validation
    const errors = validateLead(body, isCS);
    if (errors.length) {
      return res.status(400).json({ error: errors.join(" ") });
    }

    // Sanitise fields
    const safe = (v, max) => (typeof v === "string" ? v.trim().substring(0, max) : "");
    const name        = safe(body.name, 120);
    const email       = safe(body.email, 254);
    const phone       = safe(body.phone, 20);
    const company     = safe(body.company, 200);
    const service     = safe(body.service, 120);
    const siteAddress = safe(body.siteAddress, 300);
    const documentType= safe(body.documentType, 120);
    const urgency     = safe(body.urgency, 60);
    const message     = safe(body.message, 2000);
    const _subject    = safe(body._subject, 200);

    try {
      const leadData = {
        name, company, email, phone, service, siteAddress,
        documentType, urgency, message,
        subject: _subject || (isCS ? "Compliance Shield Intake" : "New Website Lead"),
        isComplianceShield: isCS,
        timestamp: FieldValue.serverTimestamp(),
        status: isCS ? "intake_pending" : "new",
        notification_status: "pending",
        sourceIp: ip,
      };

      let uploadToken = null;
      if (isCS) {
        uploadToken = generateUploadToken();
        // Store a hash so the raw token is never persisted
        leadData.uploadTokenHash = crypto.createHash("sha256").update(uploadToken).digest("hex");
        leadData.uploadSessionExpiresAt = Timestamp.fromMillis(Date.now() + UPLOAD_SESSION_TTL_MS);
        leadData.uploadedDocCount = 0;
      }

      const leadRef = await db().collection("leads").add(leadData);
      const leadId = leadRef.id;

      // For general enquiries, send notification immediately
      if (!isCS) {
        const transport = makeTransport(smtpUser.value(), smtpPass.value());
        const mail = {
          from: `"Alliance Building & Hazmat Group" <${smtpUser.value()}>`,
          replyTo: email || undefined,
          to: process.env.INTAKE_NOTIFICATION_TO || "la.asbestos@gmail.com",
          subject: `New Website Enquiry — ${service || "General"} [${leadId}]`,
          text: `New enquiry received.\n\nName: ${name}\nCompany: ${company}\nEmail: ${email}\nPhone: ${phone}\nService: ${service}\nSite Address: ${siteAddress}\nUrgency: ${urgency}\n\nMessage:\n${message}\n\nLead ID: ${leadId}`,
        };
        try {
          await transport.sendMail(mail);
          await leadRef.update({ notification_status: "sent" });
          return res.status(200).json({
            success: true,
            message: "Enquiry submitted.",
            id: leadId,
            notificationDelivered: true,
          });
        } catch (emailErr) {
          console.error("Email notification failed:", emailErr);
          await leadRef.update({ notification_status: "failed", notification_error: emailErr.message });
          return res.status(202).json({
            captured: true,
            message: "Enquiry recorded; email notification is unavailable.",
            id: leadId,
            notificationDelivered: false,
          });
        }
      }

      // Compliance Shield: return upload token to the session; do NOT email yet
      return res.status(200).json({
        success: true,
        message: "Intake registered. Please upload your documents.",
        id: leadId,
        uploadToken,         // Raw token — returned once only, not stored raw
        maxFiles: MAX_DOCS_PER_SUBMISSION,
        maxFileSizeBytes: MAX_FILE_SIZE_BYTES,
        allowedMimeTypes: COMPLIANCE_ALLOWED_MIME,
        sessionExpiresAt: Date.now() + UPLOAD_SESSION_TTL_MS,
      });

    } catch (err) {
      console.error("submitLead error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// ══════════════════════════════════════════════════════════════════════════════
// generateUploadUrl — Issue a short-lived signed PUT URL
// ══════════════════════════════════════════════════════════════════════════════
exports.generateUploadUrl = onRequest(
  { cors: false },
  async (req, res) => {
    if (handleCors(req, res)) return;
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "unknown";
    if (rateLimit(ip, 60_000, 30)) {
      return res.status(429).json({ error: "Too many requests." });
    }

    const { leadId, uploadToken, fileName, contentType, fileSize } = req.body || {};

    // Required field check
    if (!leadId || !uploadToken || !fileName || !contentType || fileSize === undefined) {
      return res.status(400).json({ error: "leadId, uploadToken, fileName, contentType, and fileSize are all required." });
    }

    // leadId format
    if (typeof leadId !== "string" || !/^[a-zA-Z0-9]{1,100}$/.test(leadId)) {
      return res.status(400).json({ error: "Invalid submission ID." });
    }

    // fileSize required, numeric, positive, within limit
    if (typeof fileSize !== "number" || !Number.isFinite(fileSize) || fileSize <= 0) {
      return res.status(400).json({ error: "fileSize must be a positive number." });
    }
    if (fileSize > MAX_FILE_SIZE_BYTES) {
      return res.status(400).json({ error: `File exceeds maximum allowed size of ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB.` });
    }

    // MIME type
    if (!ALLOWED_MIME_TYPES.includes(contentType)) {
      return res.status(400).json({ error: `File type '${contentType}' is not accepted. Accepted: PDF, JPEG, PNG.` });
    }

    try {
      // Load lead
      const leadDoc = await db().collection("leads").doc(leadId).get();
      if (!leadDoc.exists) return res.status(404).json({ error: "Submission not found." });
      const leadData = leadDoc.data();

      // Must be a Compliance Shield submission
      if (!leadData.isComplianceShield) {
        return res.status(403).json({ error: "Upload not available for this submission type." });
      }

      // Validate upload token
      const tokenHash = crypto.createHash("sha256").update(uploadToken).digest("hex");
      if (tokenHash !== leadData.uploadTokenHash) {
        return res.status(403).json({ error: "Invalid upload token." });
      }

      // Session expiry check
      const sessionExpiry = leadData.uploadSessionExpiresAt?.toMillis?.() ?? 0;
      if (Date.now() > sessionExpiry) {
        return res.status(403).json({ error: "Upload session has expired. Please re-submit the intake form." });
      }

      // Document count limit — enforced inside a Firestore transaction to prevent
      // concurrent requests bypassing the limit by issuing multiple URLs before
      // any finalization increments uploadedDocCount.
      const firestoreDb = db();
      const leadRef2 = firestoreDb.collection("leads").doc(leadId);

      let signedUrl, objectName, docRefId;
      try {
        await firestoreDb.runTransaction(async (tx) => {
          // Count all active document records: pending or already uploaded
          const activeDocs = await tx.get(
            leadRef2.collection("documents")
              .where("status", "in", ["pending_upload", "uploaded"])
          );
          if (activeDocs.size >= MAX_DOCS_PER_SUBMISSION) {
            throw Object.assign(
              new Error(`Maximum of ${MAX_DOCS_PER_SUBMISSION} documents per submission.`),
              { statusCode: 403 }
            );
          }

          // Reserve slot by writing the document record inside the transaction
          const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_").substring(0, 100);
          const uniqueId = firestoreDb.collection("_").doc().id;
          objectName = `compliance-uploads/${leadId}/${Date.now()}_${uniqueId}_${sanitizedName}`;

          const newDocRef = leadRef2.collection("documents").doc();
          docRefId = newDocRef.id;
          tx.set(newDocRef, {
            fileName: sanitizedName,
            objectName,
            contentType,
            declaredSize: fileSize,
            status: "pending_upload",
            createdAt: FieldValue.serverTimestamp(),
          });
        });
      } catch (txErr) {
        if (txErr.statusCode === 403) {
          return res.status(403).json({ error: txErr.message });
        }
        throw txErr; // re-throw for outer catch
      }

      // Generate signed URL after the slot is reserved in Firestore
      const bucket = storage().bucket();
      const file = bucket.file(objectName);
      [signedUrl] = await file.getSignedUrl({
        version: "v4",
        action: "write",
        expires: Date.now() + SIGNED_URL_TTL_MS,
        contentType: contentType,
      });

      return res.status(200).json({
        uploadUrl: signedUrl,
        objectName,
        documentId: docRefId,
        expiresAt: Date.now() + SIGNED_URL_TTL_MS,
      });

    } catch (err) {
      console.error("generateUploadUrl error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// ══════════════════════════════════════════════════════════════════════════════
// finalizeUpload — Verify storage object; mark document uploaded
// ══════════════════════════════════════════════════════════════════════════════
exports.finalizeUpload = onRequest(
  { secrets: [smtpUser, smtpPass], cors: false },
  async (req, res) => {
    if (handleCors(req, res)) return;
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "unknown";
    if (rateLimit(ip, 60_000, 30)) {
      return res.status(429).json({ error: "Too many requests." });
    }

    const { leadId, uploadToken, documentId } = req.body || {};

    if (!leadId || !uploadToken || !documentId) {
      return res.status(400).json({ error: "leadId, uploadToken, and documentId are required." });
    }
    if (typeof leadId !== "string" || !/^[a-zA-Z0-9]{1,100}$/.test(leadId)) {
      return res.status(400).json({ error: "Invalid submission ID." });
    }

    try {
      const leadDoc = await db().collection("leads").doc(leadId).get();
      if (!leadDoc.exists) return res.status(404).json({ error: "Submission not found." });
      const leadData = leadDoc.data();

      if (!leadData.isComplianceShield) {
        return res.status(403).json({ error: "Not a Compliance Shield submission." });
      }

      // Validate token
      const tokenHash = crypto.createHash("sha256").update(uploadToken).digest("hex");
      if (tokenHash !== leadData.uploadTokenHash) {
        return res.status(403).json({ error: "Invalid upload token." });
      }

      // Session expiry check — must be verified here, not only at URL generation
      const sessionExpiry = leadData.uploadSessionExpiresAt?.toMillis?.() ?? 0;
      if (Date.now() > sessionExpiry) {
        return res.status(403).json({ error: "Upload session has expired." });
      }

      // Load document metadata
      const docRef = leadDoc.ref.collection("documents").doc(documentId);
      const docSnap = await docRef.get();
      if (!docSnap.exists) return res.status(404).json({ error: "Document record not found." });
      const docData = docSnap.data();

      if (docData.status === "uploaded") {
        return res.status(200).json({ success: true, message: "Already finalized." });
      }

      // Verify object exists in Cloud Storage
      const bucket = storage().bucket();
      const file = bucket.file(docData.objectName);
      const [exists] = await file.exists();

      if (!exists) {
        await docRef.update({ status: "upload_failed", failReason: "Object not found in storage" });
        return res.status(422).json({ error: "Upload not detected in storage. Please retry." });
      }

      // Read actual object metadata — do NOT trust browser-supplied values
      const [metadata] = await file.getMetadata();
      const actualSize = parseInt(metadata.size, 10);
      const actualContentType = metadata.contentType;

      // Verify content type matches what was declared
      if (!ALLOWED_MIME_TYPES.includes(actualContentType)) {
        await file.delete().catch(() => {});
        await docRef.update({ status: "rejected", failReason: `Unexpected content type: ${actualContentType}` });
        return res.status(422).json({ error: "Uploaded file content type is not permitted. File deleted." });
      }

      // Verify size
      if (!actualSize || actualSize <= 0 || actualSize > MAX_FILE_SIZE_BYTES) {
        await file.delete().catch(() => {});
        await docRef.update({ status: "rejected", failReason: `Invalid actual size: ${actualSize}` });
        return res.status(422).json({ error: "File size verification failed. File deleted." });
      }

      // Mark document uploaded with verified metadata
      await docRef.update({
        status: "uploaded",
        verifiedSize: actualSize,
        verifiedContentType: actualContentType,
        uploadedAt: FieldValue.serverTimestamp(),
      });

      // Increment document count on lead
      const newCount = (leadData.uploadedDocCount || 0) + 1;
      await leadDoc.ref.update({ uploadedDocCount: newCount });

      // If this was the last expected upload (or manually finalized), send notification
      // The frontend will call finalizeUpload for each file; lead status is updated separately
      // by markSubmissionReady once all files are done.

      return res.status(200).json({
        success: true,
        message: "Document verified and recorded.",
        verifiedSize: actualSize,
        verifiedContentType: actualContentType,
        documentCount: newCount,
      });

    } catch (err) {
      console.error("finalizeUpload error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// ══════════════════════════════════════════════════════════════════════════════
// markSubmissionReady — Called after all documents are finalized
// Sends the final Compliance Shield notification email
// ══════════════════════════════════════════════════════════════════════════════
exports.markSubmissionReady = onRequest(
  { secrets: [smtpUser, smtpPass], cors: false },
  async (req, res) => {
    if (handleCors(req, res)) return;
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "unknown";
    if (rateLimit(ip, 60_000, 10)) {
      return res.status(429).json({ error: "Too many requests." });
    }

    const { leadId, uploadToken } = req.body || {};
    if (!leadId || !uploadToken) {
      return res.status(400).json({ error: "leadId and uploadToken are required." });
    }

    try {
      const leadDoc = await db().collection("leads").doc(leadId).get();
      if (!leadDoc.exists) return res.status(404).json({ error: "Submission not found." });
      const leadData = leadDoc.data();

      if (!leadData.isComplianceShield) {
        return res.status(403).json({ error: "Not a Compliance Shield submission." });
      }

      const tokenHash = crypto.createHash("sha256").update(uploadToken).digest("hex");
      if (tokenHash !== leadData.uploadTokenHash) {
        return res.status(403).json({ error: "Invalid upload token." });
      }

      // Session expiry check — markSubmissionReady must be called within session window
      const sessionExpiry = leadData.uploadSessionExpiresAt?.toMillis?.() ?? 0;
      if (Date.now() > sessionExpiry) {
        return res.status(403).json({ error: "Upload session has expired. Submission cannot be finalised." });
      }

      if (leadData.status === "submission_ready") {
        return res.status(200).json({ success: true, message: "Already marked ready." });
      }

      // Count verified documents
      const docsSnap = await leadDoc.ref.collection("documents")
        .where("status", "==", "uploaded").get();
      const verifiedCount = docsSnap.size;

      if (verifiedCount === 0) {
        return res.status(400).json({ error: "No verified documents found. Upload and finalize at least one document." });
      }

      await leadDoc.ref.update({
        status: "submission_ready",
        verifiedDocCount: verifiedCount,
        submittedAt: FieldValue.serverTimestamp(),
      });

      // Send final notification email
      const transport = makeTransport(smtpUser.value(), smtpPass.value());
      const mail = {
        from: `"Alliance Building & Hazmat Group" <${smtpUser.value()}>`,
        replyTo: leadData.email || undefined,
        to: process.env.INTAKE_NOTIFICATION_TO || "la.asbestos@gmail.com",
        subject: `Compliance Shield Submission Ready — ${leadData.documentType || "Document Review"} [${leadId}]`,
        text: [
          "A Compliance Shield submission is ready for review.",
          "",
          `Submission ID:     ${leadId}`,
          `Contact:           ${leadData.name}${leadData.company ? " / " + leadData.company : ""}`,
          `Email:             ${leadData.email || "(not provided)"}`,
          `Phone:             ${leadData.phone || "(not provided)"}`,
          `Site Address:      ${leadData.siteAddress}`,
          `Document Type:     ${leadData.documentType}`,
          `Urgency:           ${leadData.urgency || "Not specified"}`,
          `Verified Documents:${verifiedCount}`,
          "",
          "Description:",
          leadData.message,
          "",
          "Review via the Firebase Console or your CRM. Do not share storage object paths externally.",
        ].join("\n"),
      };

      let notificationDelivered = false;
      try {
        await transport.sendMail(mail);
        notificationDelivered = true;
        await leadDoc.ref.update({ notification_status: "sent" });
      } catch (emailErr) {
        console.error("Final notification email failed:", emailErr);
        // Submission is still marked ready — do not lose it
        await leadDoc.ref.update({ notification_status: "failed", notification_error: emailErr.message });
      }

      return res.status(200).json({
        success: true,
        message: notificationDelivered ? "Submission marked ready; notification delivered." : "Submission marked ready; email notification could not be delivered.",
        notificationDelivered,
        verifiedDocCount: verifiedCount,
      });

    } catch (err) {
      console.error("markSubmissionReady error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// ══════════════════════════════════════════════════════════════════════════════
// createComplianceShieldSubscription — Starts a Compliance Shield subscription
// (PayPal Subscriptions, recurring monthly or yearly billing, 3 tiers)
// ══════════════════════════════════════════════════════════════════════════════
exports.createComplianceShieldSubscription = onRequest(
  { secrets: [paypalClientId, paypalClientSecret], cors: false },
  async (req, res) => {
    if (handleCors(req, res)) return;
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "unknown";
    if (rateLimit(ip, 60_000, 10)) {
      return res.status(429).json({ error: "Too many requests. Please try again shortly." });
    }

    const body = req.body || {};
    if (body._hp && String(body._hp).trim() !== "") {
      return res.status(400).json({ error: "Submission rejected." });
    }

    const safe = (v, max) => (typeof v === "string" ? v.trim().substring(0, max) : "");
    const name = safe(body.name, 120);
    const email = safe(body.email, 254);
    const phone = safe(body.phone, 20);
    const propertyAddress = safe(body.propertyAddress, 300);
    const tierKey = safe(body.tier, 20).toLowerCase();
    const interval = safe(body.interval, 10).toLowerCase();

    const errors = [];
    if (!name || name.length < 2) errors.push("Name is required (min 2 characters).");
    if (!email || !EMAIL_RE.test(email)) errors.push("A valid email address is required.");
    if (!phone || !PHONE_RE.test(phone)) errors.push("A valid phone number is required.");
    if (!propertyAddress || propertyAddress.length < 5) errors.push("Property address is required.");
    const plan = COMPLIANCE_SHIELD_PLANS[tierKey];
    if (!plan) errors.push("A valid plan tier is required.");
    if (interval !== "month" && interval !== "year") errors.push("A valid billing interval is required.");
    if (errors.length) return res.status(400).json({ error: errors.join(" ") });

    // Server-side plan lookup only — the client never sets the amount charged.
    const planId = COMPLIANCE_SHIELD_PLAN_IDS[tierKey]?.[interval];
    if (!planId) {
      console.error(`No PayPal plan ID configured for ${tierKey}/${interval}`);
      return res.status(500).json({ error: "Subscription plans are not set up yet. Please call 0403 126 276." });
    }

    try {
      const leadRef = await db().collection("leads").add({
        name, email, phone, propertyAddress,
        service: `Compliance Shield™ ${plan.label}`,
        isComplianceShield: true,
        offerType: "tiered_subscription",
        tier: tierKey,
        billingInterval: interval,
        subscriptionStatus: "approval_pending",
        timestamp: FieldValue.serverTimestamp(),
        sourceIp: ip,
      });
      const leadId = leadRef.id;

      const [firstName, ...rest] = name.split(" ");
      const accessToken = await getPaypalAccessToken();
      const subRes = await fetch(`${paypalApiBase()}/v1/billing/subscriptions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "PayPal-Request-Id": leadId, // idempotency key
        },
        body: JSON.stringify({
          plan_id: planId,
          custom_id: leadId,
          subscriber: {
            name: { given_name: firstName || name, surname: rest.join(" ") || "-" },
            email_address: email,
          },
          application_context: {
            brand_name: "Alliance Building & Hazmat Group",
            locale: "en-AU",
            shipping_preference: "NO_SHIPPING",
            user_action: "SUBSCRIBE_NOW",
            return_url: `${SITE_ORIGIN}/compliance-shield/?checkout=success`,
            cancel_url: `${SITE_ORIGIN}/compliance-shield/?checkout=cancelled`,
          },
        }),
      });
      const subscription = await subRes.json();
      if (!subRes.ok) {
        console.error("PayPal subscription creation failed:", subscription);
        throw new Error("PayPal subscription creation failed");
      }

      const approveUrl = (subscription.links || []).find((l) => l.rel === "approve")?.href;
      if (!approveUrl) throw new Error("PayPal did not return an approval URL");

      await leadRef.update({ paypalSubscriptionId: subscription.id });

      return res.status(200).json({ success: true, id: leadId, url: approveUrl });
    } catch (err) {
      console.error("createComplianceShieldSubscription error:", err);
      return res.status(500).json({ error: "Could not start checkout. Please call 0403 126 276." });
    }
  }
);

// ══════════════════════════════════════════════════════════════════════════════
// paypalWebhook — Confirms Compliance Shield subscription payments/renewals
// ══════════════════════════════════════════════════════════════════════════════
exports.paypalWebhook = onRequest(
  { secrets: [paypalClientId, paypalClientSecret, paypalWebhookId, smtpUser, smtpPass], cors: false },
  async (req, res) => {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    let verified;
    try {
      const accessToken = await getPaypalAccessToken();
      verified = await verifyPaypalWebhookSignature(req, accessToken);
    } catch (err) {
      console.error("paypalWebhook verification request failed:", err);
      return res.status(400).send("Webhook verification failed.");
    }
    if (!verified) {
      console.error("paypalWebhook signature did not verify.");
      return res.status(400).send("Webhook signature verification failed.");
    }

    const event = req.body || {};
    const notifyTo = process.env.INTAKE_NOTIFICATION_TO || "la.asbestos@gmail.com";
    const notify = async (subject, text) => {
      try {
        const transport = makeTransport(smtpUser.value(), smtpPass.value());
        await transport.sendMail({
          from: `"Alliance Building & Hazmat Group" <${smtpUser.value()}>`,
          to: notifyTo,
          subject,
          text,
        });
      } catch (emailErr) {
        console.error("paypalWebhook notification email failed:", emailErr);
      }
    };

    try {
      switch (event.event_type) {
        case "BILLING.SUBSCRIPTION.ACTIVATED": {
          const subscription = event.resource || {};
          const leadId = subscription.custom_id;
          let tier = "unknown";
          if (leadId) {
            const leadSnap = await db().collection("leads").doc(leadId).get();
            tier = leadSnap.data()?.tier || "unknown";
            await leadSnap.ref.set({
              subscriptionStatus: "active",
              paypalSubscriptionId: subscription.id,
              paypalSubscriberEmail: subscription.subscriber?.email_address,
              subscriptionStartedAt: FieldValue.serverTimestamp(),
            }, { merge: true });
          }
          await notify(
            `New Compliance Shield ${tier} subscription [${leadId || subscription.id}]`,
            `A customer has approved and started a Compliance Shield subscription.\n\nLead ID: ${leadId || "unknown"}\nTier: ${tier}\nPayPal subscription: ${subscription.id}\nPayPal subscriber: ${subscription.subscriber?.email_address || "unknown"}\n\nSchedule the first 48-hour desktop review.`
          );
          break;
        }
        case "PAYMENT.SALE.COMPLETED": {
          const sale = event.resource || {};
          const subscriptionId = sale.billing_agreement_id;
          if (!subscriptionId) break;
          const subs = await db().collection("leads")
            .where("paypalSubscriptionId", "==", subscriptionId).limit(1).get();
          if (subs.empty) break;
          const leadDoc = subs.docs[0];
          const leadData = leadDoc.data();
          const isRenewal = !!leadData.paymentCount; // first payment already notified via ACTIVATED
          await leadDoc.ref.update({
            lastPaymentAt: FieldValue.serverTimestamp(),
            lastPaymentId: sale.id,
            paymentCount: (leadData.paymentCount || 0) + 1,
          });
          if (isRenewal) {
            await notify(
              `Compliance Shield ${leadData.tier || "unknown"} subscription renewed [${leadDoc.id}]`,
              `A Compliance Shield subscription has renewed.\n\nLead ID: ${leadDoc.id}\nTier: ${leadData.tier || "unknown"}\nPayPal subscription: ${subscriptionId}\nAmount: $${sale.amount?.total || "?"} ${sale.amount?.currency || "AUD"}\n\nSchedule the renewal 48-hour desktop review.`
            );
          }
          break;
        }
        case "PAYMENT.SALE.DENIED": {
          const sale = event.resource || {};
          await notify(
            `Compliance Shield payment FAILED [${sale.billing_agreement_id || sale.id}]`,
            `A Compliance Shield subscription payment failed.\n\nPayPal subscription: ${sale.billing_agreement_id || "unknown"}\n\nPayPal will retry per the plan's payment failure threshold; follow up with the customer if it keeps failing.`
          );
          break;
        }
        case "BILLING.SUBSCRIPTION.SUSPENDED": {
          const subscription = event.resource || {};
          await notify(
            `Compliance Shield subscription SUSPENDED [${subscription.id}]`,
            `A Compliance Shield subscription was suspended, usually after repeated payment failures.\n\nPayPal subscription: ${subscription.id}`
          );
          break;
        }
        case "BILLING.SUBSCRIPTION.CANCELLED": {
          const subscription = event.resource || {};
          const subs = await db().collection("leads")
            .where("paypalSubscriptionId", "==", subscription.id).limit(1).get();
          if (!subs.empty) {
            await subs.docs[0].ref.update({ subscriptionStatus: "cancelled" });
          }
          await notify(
            `Compliance Shield subscription cancelled [${subscription.id}]`,
            `A Compliance Shield subscription was cancelled.\n\nPayPal subscription: ${subscription.id}`
          );
          break;
        }
        default:
          break;
      }
      return res.status(200).json({ received: true });
    } catch (err) {
      console.error("paypalWebhook handling error:", err);
      return res.status(500).json({ error: "Webhook handling failed." });
    }
  }
);
