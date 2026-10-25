document.addEventListener("DOMContentLoaded", function () {
  const ENDPOINT = "https://us-central1-alliance-hub-5ed2c.cloudfunctions.net/submitLead";
  const forms = document.querySelectorAll("form:not(#portal-form)");

  function getStatus(form) {
    let status =
      form.querySelector(".form-status") ||
      form.querySelector(".form-success") ||
      document.getElementById("formSuccess") ||
      document.getElementById("orderSuccess") ||
      document.getElementById("form-success");
    if (!status) {
      status = document.createElement("div");
      status.className = "form-status";
      form.appendChild(status);
    }
    return status;
  }

  function callLinks() {
    return '<a href="tel:0403126276" style="color:#f59e0b;font-weight:bold;text-decoration:underline;">0403 126 276</a>';
  }

  function trackLead(form, deliveryStatus) {
    const eventName = deliveryStatus === "delivered" ? "generate_lead" : "lead_recorded_unnotified";
    if (typeof window.gtag !== "function") {
      if (Array.isArray(window.dataLayer)) window.dataLayer.push({event: eventName, form_id: form.id || "website-form", delivery_status: deliveryStatus});
      return;
    }
    window.gtag("event", eventName, {
      form_id: form.id || "website-form",
      lead_source: "website",
      delivery_status: deliveryStatus,
    });
  }

  function ensureHoneypot(form) {
    if (form.querySelector('[name="_honey"],[name="_hp"]')) return;
    const hp = document.createElement("input");
    hp.type = "text";
    hp.name = "_honey";
    hp.tabIndex = -1;
    hp.autocomplete = "off";
    hp.setAttribute("aria-hidden", "true");
    hp.style.position = "absolute";
    hp.style.left = "-10000px";
    form.prepend(hp);
  }

  function toPayload(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const services = formData.getAll("service[]").filter(Boolean);
    if (services.length) data.service = services.join(", ");
    if (!data._subject) {
      const service = data.service || data.product || data.outcome || "Website enquiry";
      data._subject = `New Website Enquiry — ${service}`;
    }
    return data;
  }

  const UPLOAD_BASE = "https://us-central1-alliance-hub-5ed2c.cloudfunctions.net/";
  const pendingUploads = new WeakMap();
  const ALLOWED_UPLOADS = new Set(["image/jpeg", "image/png", "application/pdf"]);
  function validateUploads(files) {
    return files.length <= 10 && files.every(file => file.size > 0 && file.size <= 20 * 1024 * 1024 && ALLOWED_UPLOADS.has(file.type));
  }
  async function uploadApi(endpoint, data) {
    const response = await fetch(UPLOAD_BASE + endpoint, {
      method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(data)
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || "The upload service could not complete the request.");
    return body;
  }
  async function sendWithAttachments(form, files, status) {
    const current = pendingUploads.get(form) || { id: "", uploads: [], token: "", expiresAt: 0 };
    pendingUploads.set(form, current);
    if (current.id && (current.fileCount !== files.length || files.some((file, i) => current.fileNames[i] !== file.name))) {
      throw new Error("Your previous upload is pending. Keep the same files selected or contact Alliance with reference " + current.id + ".");
    }
    if (!current.id) {
      status.textContent = "Recording property details…";
      const data = toPayload(form);
      delete data.attachment;
      if (!data.service) data.service = "Detailed property enquiry";
      data.fileCount = files.length;
      data.documentType = (data.service + " — supporting documents").slice(0, 120);
      const saved = await uploadApi("submitLead", data);
      if (saved.success !== true || !saved.id || !saved.uploadToken) {
        throw new Error("We could not confirm the upload session. Please call 0403 126 276.");
      }
      current.id = saved.id;
      current.token = saved.uploadToken;
      current.expiresAt = saved.sessionExpiresAt || 0;
      current.fileCount = files.length;
      current.fileNames = files.map(file => file.name);
    }
    if (current.expiresAt && Date.now() > current.expiresAt) {
      throw new Error("Upload session expired. Please call 0403 126 276 with reference " + current.id + ".");
    }
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      status.textContent = "Uploading file " + (i + 1) + " of " + files.length + "…";
      let item = current.uploads[i];
      if (item?.complete) continue;
      if (!item) {
        item = await uploadApi("generateUploadUrl", {
          leadId: current.id, uploadToken: current.token, fileName: file.name,
          contentType: file.type, fileSize: file.size
        });
        const uri = new URL(item.uploadUrl || "");
        if (uri.protocol !== "https:" || !(uri.hostname === "storage.googleapis.com" || uri.hostname.endsWith(".storage.googleapis.com")) || !item.documentId) {
          throw new Error("The secure upload address was not recognised.");
        }
        current.uploads[i] = item;
      }
      if (!item.transferred) {
        if (item.expiresAt && Date.now() > item.expiresAt) throw new Error("Upload link expired; contact Alliance with reference " + current.id + ".");
        const response = await fetch(item.uploadUrl, {
          method: "PUT", headers: {"Content-Type": file.type}, body: file
        });
        if (!response.ok) throw new Error("File upload interrupted. Please retry with the same files.");
        item.transferred = true;
      }
      const confirmed = await uploadApi("finalizeUpload", {
        leadId: current.id, uploadToken: current.token, documentId: item.documentId
      });
      if (confirmed.success !== true) throw new Error("File confirmation failed. Please retry.");
      item.complete = true;
    }
    status.textContent = "Finalising your enquiry…";
    const final = await uploadApi("markSubmissionReady", {
      leadId: current.id, uploadToken: current.token
    });
    if (final.success !== true || final.verifiedDocCount !== files.length) {
      throw new Error("Your files could not all be confirmed. Call 0403 126 276 with reference " + current.id + ".");
    }
    pendingUploads.delete(form);
    return { id: current.id, delivered: final.notificationDelivered === true, fileCount: files.length };
  }

  forms.forEach((form) => {
    ensureHoneypot(form);
    form.removeAttribute("action");
    form.removeAttribute("method");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const files = Array.from(form.querySelectorAll('input[type="file"]')).flatMap((input) => Array.from(input.files || []));
      if (files.length && !validateUploads(files)) {
        const status = getStatus(form);
        status.style.display = "block";
        status.setAttribute("role", "alert");
        status.textContent = "Attach up to 10 JPG, PNG or PDF files, each under 20 MB.";
        return;
      }
      const submit = form.querySelector('button[type="submit"]') || form.querySelector("button");
      const originalLabel = submit ? submit.innerHTML : "Send property details";
      const status = getStatus(form);

      if (submit) {
        submit.disabled = true;
        submit.textContent = "Sending…";
      }

      try {
        if (files.length) {
          const submitted = await sendWithAttachments(form, files, status);
          form.reset();
          status.style.display = "block";
          status.classList.add("show");
          status.textContent = submitted.delivered
            ? "Your enquiry and " + submitted.fileCount + " files have been submitted. Reference: " + submitted.id
            : "Your enquiry and files were saved (reference " + submitted.id + "), but email notification has not been confirmed. Please call 0403 126 276 if urgent.";
          if (submit) submit.textContent = "Request recorded";
          trackLead(form, submitted.delivered ? "delivered" : "captured");
          return;
        }
        const response = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toPayload(form)),
        });
        const payload = await response.json().catch(() => ({}));

        if (response.status === 202 && payload.duplicate) {
          form.reset();
          status.style.display = "block";
          status.classList.add("show");
          status.innerHTML = '<div style="background:#064e3b;color:#a7f3d0;border:1px solid #059669;padding:16px 20px;border-radius:8px;margin-top:16px;line-height:1.5;">We have already recorded these details. No second enquiry has been created. If the matter is urgent, call ' + callLinks() + '.</div>';
          if (submit) submit.textContent = "Already recorded";
          return;
        }
        if (response.ok && payload.notificationDelivered) {
          trackLead(form, "delivered");
          form.reset();
          status.style.display = "block";
          status.classList.add("show");
          status.innerHTML =
            '<div style="background:#064e3b;color:#a7f3d0;border:1px solid #059669;padding:16px 20px;border-radius:8px;margin-top:16px;font-weight:600;line-height:1.5;">Your enquiry has been sent to Alliance Group. We’ll contact you using the details provided.</div>';
          if (submit) submit.textContent = "Enquiry sent";
          return;
        }
        if (response.status === 202 && payload.captured) {
          trackLead(form, "captured");
          form.reset();
          status.style.display = "block";
          status.classList.add("show");
          status.innerHTML =
            `<div style="background:#78350f;color:#fef3c7;border:1px solid #f59e0b;padding:16px 20px;border-radius:8px;margin-top:16px;font-weight:600;line-height:1.5;">Your details were recorded, but the instant notification did not complete. For urgent work please call ${callLinks()}.</div>`;
          if (submit) submit.textContent = "Request recorded";
          return;
        }

        throw new Error(payload.error || "Delivery endpoint rejected the enquiry.");
      } catch (error) {
        console.warn("Website intake delivery failed:", error);
        status.style.display = "block";
        status.classList.remove("show");
        status.innerHTML =
          `<div style="background:#450a0a;color:#fecaca;border:1px solid #dc2626;padding:16px 20px;border-radius:8px;margin-top:16px;line-height:1.5;">We could not send your enquiry online. Please call ${callLinks()}.</div>`;
        if (submit) {
          submit.disabled = false;
          submit.innerHTML = originalLabel;
        }
      }
    });
  });
});
