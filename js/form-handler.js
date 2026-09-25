document.addEventListener("DOMContentLoaded", function() {
  const FIREBASE_FUNCTION_URL = "https://us-central1-alliance-hub-5ed2c.cloudfunctions.net/submitLead";
  const forms = document.querySelectorAll("form:not(#portal-form)");

  function getStatus(form) {
    let status = form.querySelector(".form-status") || form.querySelector(".form-success") || document.getElementById("formSuccess") || document.getElementById("orderSuccess");
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

  forms.forEach((form) => {
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
        submit.textContent = "Recording your request…";
      }

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      const services = formData.getAll("service[]").filter(Boolean);
      if (services.length) data.service = services.join(", ");
      if (!data._subject) data._subject = `Website intake — ${data.name || "Client"}`;

      try {
        const response = await fetch(FIREBASE_FUNCTION_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const payload = await response.json().catch(() => ({}));

        if (response.status === 202 && payload.captured) {
          form.reset();
          status.style.display = "block";
          status.classList.add("show");
          status.innerHTML = `<div style="background:#78350f;color:#fef3c7;border:1px solid #f59e0b;padding:16px 20px;border-radius:8px;margin-top:16px;font-weight:600;line-height:1.5;">Your request has been recorded. Email notifications are not currently available, so for urgent work please call ${callLinks()}.</div>`;
          if (submit) submit.textContent = "Request recorded";
          return;
        }

        if (response.ok && payload.notificationDelivered) {
          form.reset();
          status.style.display = "block";
          status.classList.add("show");
          status.innerHTML = '<div style="background:#064e3b;color:#a7f3d0;border:1px solid #059669;padding:16px 20px;border-radius:8px;margin-top:16px;font-weight:600;line-height:1.5;">Your request has been recorded and the team has been notified.</div>';
          if (submit) submit.textContent = "Request recorded";
          return;
        }
      } catch (error) {
        console.warn("Private lead recording failed:", error);
      }

      status.style.display = "block";
      status.classList.remove("show");
      status.innerHTML = `<div style="background:#450a0a;color:#fecaca;border:1px solid #dc2626;padding:16px 20px;border-radius:8px;margin-top:16px;line-height:1.5;">We could not record your request online. Please call ${callLinks()}.</div>`;
      if (submit) {
        submit.disabled = false;
        submit.innerHTML = originalLabel;
      }
    });
  });
});
