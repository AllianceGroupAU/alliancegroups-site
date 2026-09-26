const FIREBASE_FUNCTION_URL = "https://us-central1-alliance-hub-5ed2c.cloudfunctions.net/submitLead";
const NOTIFY_TO = "la.asbestos@gmail.com";
const NOTIFY_FROM = "website@alliancegroups.com.au";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(value, max = 2000) {
  if (Array.isArray(value)) return value.map((v) => clean(v, max)).filter(Boolean).join(", ");
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function normaliseLead(raw) {
  const service = clean(raw.service || raw.product || (raw.outcome ? "Compliance Shield Review" : "General website enquiry"), 160);
  const message = clean(raw.message || raw.notes || raw.documents || raw.additionalInformation || raw.outcome || "Website enquiry", 3000);
  return {
    name: clean(raw.name, 120),
    email: clean(raw.email || raw._replyto, 254),
    phone: clean(raw.phone, 30),
    company: clean(raw.company, 200),
    service,
    siteAddress: clean(raw.siteAddress || raw.address || raw.suburb, 300),
    urgency: clean(raw.urgency, 80),
    message,
    subject: clean(raw._subject || "Website enquiry — Alliance Group", 220),
    raw,
  };
}
function validateLead(lead) {
  const errors = [];
  if (lead.name.length < 2) errors.push("Name is required.");
  if (!lead.email && !lead.phone) errors.push("Email or phone is required.");
  if (lead.email && !EMAIL_RE.test(lead.email)) errors.push("Email address is invalid.");
  if (lead.message.length < 5) errors.push("Please provide a brief description.");
  return errors;
}

function safeEntries(raw) {
  const blocked = new Set(["_honey", "_hp", "_next"]);
  return Object.entries(raw || {})
    .filter(([key]) => !blocked.has(key))
    .map(([key, value]) => [key.replace(/^_/, ""), clean(value, 3000)])
    .filter(([, value]) => value);
}

function buildEmailText(lead) {
  const lines = [
    "New Alliance Group website enquiry",
    "",
    `Name: ${lead.name}`,
    `Email: ${lead.email || "Not supplied"}`,
    `Phone: ${lead.phone || "Not supplied"}`,
    `Service: ${lead.service}`,
    `Site / suburb: ${lead.siteAddress || "Not supplied"}`,
    `Urgency: ${lead.urgency || "Not supplied"}`,
    "",
    "Details:",
    lead.message,
    "",
    "Additional form fields:",
  ];
  for (const [key, value] of safeEntries(lead.raw)) {
    if (["name", "email", "phone", "service", "message"].includes(key)) continue;
    lines.push(`${key}: ${value}`);
  }
  return lines.join("\n");
}

async function archiveLead(lead, fetchImpl) {
  try {
    const response = await fetchImpl(FIREBASE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": "https://alliancegroups.com.au",
      },
      body: JSON.stringify({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        service: lead.service,
        siteAddress: lead.siteAddress,
        urgency: lead.urgency,
        message: lead.message,
        _subject: lead.subject,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    return { ok: response.ok || response.status === 202, status: response.status, payload };
  } catch (error) {
    return { ok: false, status: 0, payload: { error: String(error) } };
  }
}
export async function handleIntake(request, env, fetchImpl = fetch, ctx = null) {
  const raw = await request.json().catch(() => null);
  if (!raw || typeof raw !== "object") {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (clean(raw._honey || raw._hp, 200)) {
    return Response.json({ success: true, notificationDelivered: true });
  }

  const lead = normaliseLead(raw);
  const errors = validateLead(lead);
  if (errors.length) {
    return Response.json({ error: errors.join(" ") }, { status: 400 });
  }

  const archivePromise = archiveLead(lead, fetchImpl);
  let emailResult;
  try {
    emailResult = await env.EMAIL.send({
      from: NOTIFY_FROM,
      to: NOTIFY_TO,
      subject: lead.subject,
      text: buildEmailText(lead),
      replyTo: lead.email || undefined,
    });
  } catch (error) {
    emailResult = { error: String(error) };
  }
  const delivered = !emailResult?.error;

  if (delivered) {
    if (ctx && typeof ctx.waitUntil === "function") {
      ctx.waitUntil(archivePromise);
      return Response.json({
        success: true,
        notificationDelivered: true,
        archived: "queued",
      });
    }

    const archive = await archivePromise;
    return Response.json({
      success: true,
      notificationDelivered: true,
      archived: archive.ok,
      archiveStatus: archive.status,
    });
  }

  const archive = await archivePromise;
  if (archive.ok) {
    return Response.json({
      captured: true,
      notificationDelivered: false,
      message: "Enquiry recorded; notification delivery failed.",
    }, { status: 202 });
  }

  return Response.json({
    error: "We could not deliver or record your enquiry. Please call Alliance Group.",
  }, { status: 502 });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/api/intake") {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }
      return handleIntake(request, env, fetch, ctx);
    }
    return env.ASSETS.fetch(request);
  },
};
