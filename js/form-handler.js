document.addEventListener("DOMContentLoaded", function() {
  const FORMSUBMIT_URL = 'https://formsubmit.co/ajax/info@alliancegroups.com.au';
  const FIREBASE_FUNCTION_URL = 'https://us-central1-alliance-hub-5ed2c.cloudfunctions.net/submitLead';

  // Select all forms on the page except portal-form (which manages multi-file signed URLs)
  const forms = document.querySelectorAll('form:not(#portal-form)');

  forms.forEach(form => {
    form.removeAttribute('action');
    form.removeAttribute('method');

    form.addEventListener('submit', async function(e) {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('button');
      let statusDiv = form.querySelector('.form-status') || form.querySelector('.form-success') || document.getElementById('formSuccess') || document.getElementById('orderSuccess');

      if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.className = 'form-status';
        form.appendChild(statusDiv);
      }

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Submit';
      if (submitBtn) {
        submitBtn.innerHTML = '<span>Reviewing details...</span>';
        submitBtn.disabled = true;
      }

      if (window.dataLayer) {
        window.dataLayer.push({ event: 'enquiry_form_start', formId: form.id || 'general_form' });
      }

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // Format subject line if missing
      if (!data.subject && !data._subject) {
        if (form.id === 'compliance-shield-form') {
          data._subject = 'Compliance Shield Review Order ($395 + GST)';
        } else if (form.id === 'asbestosOrderForm') {
          data._subject = `AUasbestos Service Order — ${data.product || 'Asbestos Testing/Removal'}`;
        } else {
          data._subject = `Website Intake: ${data.service || data.documentType || 'Building & Hazmat Response'} - ${data.name || 'Client'}`;
        }
      } else if (data.subject && !data._subject) {
        data._subject = data.subject;
      }

      let submittedSuccessfully = false;

      // 1. Primary delivery channel: FormSubmit sends the enquiry to info@alliancegroups.com.au.
      // Customer-facing success is allowed ONLY when this delivery request succeeds.
      try {
        const fsRes = await fetch(FORMSUBMIT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (fsRes.ok) {
          let fsPayload = null;
          try {
            fsPayload = await fsRes.json();
          } catch (_) {
            // A successful HTTP status is sufficient if FormSubmit returns no JSON body.
          }

          if (!fsPayload || fsPayload.success !== false) {
            submittedSuccessfully = true;
          }
        } else {
          console.error('FormSubmit delivery failed with status:', fsRes.status);
        }
      } catch (fsErr) {
        console.error('FormSubmit delivery failed:', fsErr);
      }

      // 2. Secondary: Cloud function lead logging only.
      // This path must NEVER turn a failed email delivery into a false "Received" message.
      try {
        const fbRes = await fetch(FIREBASE_FUNCTION_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (!fbRes.ok) {
          console.warn('Backend lead logging returned status:', fbRes.status);
        }
      } catch (fbErr) {
        console.warn('Backend lead logging failed:', fbErr);
      }

      if (submittedSuccessfully) {
        form.reset();
        statusDiv.style.display = 'block';
        statusDiv.classList.add('show');
        statusDiv.innerHTML = '<div style="background:#064e3b;color:#a7f3d0;border:1px solid #059669;padding:16px 20px;border-radius:8px;margin-top:16px;font-weight:600;font-size:0.95rem;line-height:1.5;">✓ Thank you. We have received your property details. Our team will review the information and identify the safest next step. For urgent make-safes, call <a href="tel:0410942905" style="color:#f59e0b;text-decoration:underline;">0410 942 905</a>.</div>';

        if (submitBtn) {
          submitBtn.innerHTML = '<span>✓ Received</span>';
        }

        // Push conversion event to Google Tag Manager / Google Analytics only after confirmed delivery.
        if (window.dataLayer) {
          window.dataLayer.push({
            'event': 'enquiry_form_submit',
            'formId': form.id || 'general_form'
          });
        }
        if (typeof gtag === 'function') {
          gtag('event', 'conversion', { 'send_to': 'AW-18006768389/lead_form_submit' });
        }
      } else {
        statusDiv.style.display = 'block';
        statusDiv.classList.remove('show');
        statusDiv.innerHTML = '<div style="background:#450a0a;color:#fecaca;border:1px solid #dc2626;padding:16px 20px;border-radius:8px;margin-top:16px;font-size:0.9rem;">We could not confirm delivery of your enquiry. Please call our 24/7 hotline directly on <a href="tel:0410942905" style="color:#f59e0b;font-weight:bold;text-decoration:underline;">0410 942 905</a> or email <a href="mailto:info@alliancegroups.com.au" style="color:#f59e0b;text-decoration:underline;">info@alliancegroups.com.au</a>.</div>';
        if (submitBtn) {
          submitBtn.innerHTML = originalBtnText;
          submitBtn.disabled = false;
        }
      }
    });
  });
});
