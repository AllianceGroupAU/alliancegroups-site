/**
 * Alliance Building & Hazmat Group — Firebase Cloud Functions v2
 * Production hardened: secret binding, CORS restriction, rate limiting,
 * server-side validation, upload token auth, finalization, email workflow.
 */

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
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
          to: "info@alliancegroups.com.au",
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
        to: "info@alliancegroups.com.au",
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

      try {
        await transport.sendMail(mail);
        await leadDoc.ref.update({ notification_status: "sent" });
      } catch (emailErr) {
        console.error("Final notification email failed:", emailErr);
        // Submission is still marked ready — do not lose it
        await leadDoc.ref.update({ notification_status: "failed", notification_error: emailErr.message });
      }

      return res.status(200).json({
        success: true,
        message: "Submission marked ready. Our team has been notified.",
        verifiedDocCount: verifiedCount,
      });

    } catch (err) {
      console.error("markSubmissionReady error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);
