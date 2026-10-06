document.addEventListener("DOMContentLoaded", function () {
  const ENDPOINT = "/api/intake";
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
    return '<a href="tel:0410942905" style="color:#f59e0b;font-weight:bold;text-decoration:underline;">0410 942 905</a> or <a href="tel:0403126276" style="color:#f59e0b;font-weight:bold;text-decoration:underline;">0403 126 276</a>';
  }

  function trackLead(form, deliveryStatus) {
    if (typeof window.gtag !== "function") return;
    window.gtag("event", "generate_lead", {
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
      const submit = form.querySelector('button[type="submit"]') || form.querySelector("button");
      const originalLabel = submit ? submit.innerHTML : "Send property details";
      const status = getStatus(form);

      if (submit) {
        submit.disabled = true;
        submit.textContent = "Sending…";
      }

      try {
        const response = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toPayload(form)),
        });
        const payload = await response.json().catch(() => ({}));

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
