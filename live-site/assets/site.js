(function () {
  'use strict';
  const API = 'https://us-central1-alliance-hub-5ed2c.cloudfunctions.net/';
  const MAX_FILE_BYTES = 20 * 1024 * 1024;
  const MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

  function makeLead(data, path = '') {
    const read = (name, max) => String(data.get(name) || '').trim().slice(0, max);
    const extra = [
      ['Property type', read('property', 60)], ['Access / tenancy', read('access', 80)],
      ['Claim reference', read('claim', 120)], ['Best time to call', read('bestTime', 40)], ['Contact consent', read('consent', 10)],
      ['Website page', path.split('?')[0].slice(0, 100)]
    ].filter(([, value]) => value).map(([label, value]) => `${label}: ${value}`);
    const lead = {
      name: read('name', 120), email: read('email', 254), phone: read('phone', 20),
      service: read('service', 120), siteAddress: read('siteAddress', 300) || read('suburb', 150),
      urgency: read('urgency', 60), _hp: read('_hp', 200),
      property: read('property', 80), bestTime: read('bestTime', 40),
      message: [read('message', 1500), ...extra].join('\n\n'),
      _subject: `Website enquiry — ${read('service', 120)}`
    };
    if (lead._hp) throw new Error('Please leave the extra verification field empty.');
    if (lead.name.length < 2) throw new Error('Please enter your name.');
    if (!lead.phone && !lead.email) throw new Error('Please enter a phone number or email.');
    if (lead.phone && !/^[\d\s()+\-]{7,20}$/.test(lead.phone)) throw new Error('Please check your phone number.');
    if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email)) throw new Error('Please check your email address.');
    if (!lead.service) throw new Error('Please select the service you need.');
    if (read('formKind', 30) !== 'detailed' && read('message', 1500).length < 5) throw new Error('Please add a short description of the work or damage.');
    return lead;
  }

  function checkFiles(files) {
    if (files.length > 10) throw new Error('Attach up to 10 files. Email any additional files with your enquiry reference.');
    for (const file of files) {
      if (!MIME_TYPES.includes(file.type)) throw new Error(`${file.name}: please use JPG, PNG or PDF. Email videos and other file formats separately.`);
      if (!file.size || file.size > MAX_FILE_BYTES) throw new Error(`${file.name}: choose a non-empty file up to 20 MB.`);
    }
  }

  async function apiRequest(endpoint, payload, request = fetch) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await request(API + endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), signal: controller.signal
      });
      let result;
      try { result = await response.json(); } catch { throw new Error('The server response could not be confirmed. Please contact us before submitting again.'); }
      if (!response.ok) {
        if (response.status === 429) throw new Error('Too many attempts. Please wait a minute, then try again, or call us.');
        if (response.status >= 500) throw new Error('The enquiry service could not complete this request. Please try again or contact us directly.');
        throw new Error(result.error || 'Please check your details and try again.');
      }
      return result;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('The request timed out. Delivery is unconfirmed; please contact us before submitting again.');
      if (error instanceof TypeError) throw new Error('The connection was interrupted. Delivery is unconfirmed. Your details remain here; please contact us before submitting again.');
      throw error;
    } finally { clearTimeout(timer); }
  }

  async function submitIntake(lead, files = [], session = {}, onProgress = () => {}, request = fetch) {
    checkFiles(files);
    if (files.length && lead.siteAddress.length < 5) throw new Error('Please enter the property address before uploading files.');
    if (!session.id) {
      onProgress('Sending your enquiry…');
      const payload = { ...lead, fileCount: files.length };
      // The existing backend uses its document-intake workflow for authenticated uploads.
      if (files.length) payload.documentType = `${lead.service} — supporting documents`;
      const result = await apiRequest('submitLead', payload, request);
      if (result.success !== true || !result.id || result.id === 'noop') throw new Error('Your submission could not be confirmed. Please contact us directly.');
      session.id = result.id;
      session.notificationDelivered = result.notificationDelivered === true;
      session.uploadToken = result.uploadToken;
      session.expiresAt = result.sessionExpiresAt;
      session.uploads = [];
    }
    if (!files.length) return { id: session.id, notificationDelivered: session.notificationDelivered === true };
    if (!session.uploadToken) throw new Error(`Enquiry ${session.id} was recorded, but file uploads are unavailable. Please email your files with this reference.`);
    if (session.expiresAt && Date.now() > session.expiresAt) throw new Error(`The upload session for ${session.id} has expired. Please email your remaining files with this reference.`);
    for (let i = 0; i < files.length; i++) {
      let upload = session.uploads[i];
      if (upload?.complete) continue;
      onProgress(`Uploading file ${i + 1} of ${files.length}…`);
      if (!upload) {
        upload = await apiRequest('generateUploadUrl', {
          leadId: session.id, uploadToken: session.uploadToken,
          fileName: files[i].name, contentType: files[i].type, fileSize: files[i].size
        }, request);
        const uploadHost = new URL(upload.uploadUrl).hostname;
        if (!upload.documentId || !upload.uploadUrl.startsWith('https://') || !(uploadHost === 'storage.googleapis.com' || uploadHost.endsWith('.storage.googleapis.com'))) {
          throw new Error('The file-upload address could not be verified. Please email your files with your enquiry reference.');
        }
        session.uploads[i] = upload;
      }
      if (!upload.transferred) {
        if (upload.expiresAt && Date.now() > upload.expiresAt) throw new Error('The file-upload link expired. Please email your remaining files with your enquiry reference.');
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 120000);
        try {
          const response = await request(upload.uploadUrl, { method: 'PUT', headers: { 'Content-Type': files[i].type }, body: files[i], signal: controller.signal });
          if (!response.ok) throw new Error('The file upload was interrupted. Retry to resume, or email the file with your enquiry reference.');
          upload.transferred = true;
        } finally { clearTimeout(timer); }
      }
      const result = await apiRequest('finalizeUpload', { leadId: session.id, uploadToken: session.uploadToken, documentId: upload.documentId }, request);
      if (result.success !== true) throw new Error('The uploaded file could not be confirmed. Please retry or email us with your enquiry reference.');
      upload.complete = true;
    }
    onProgress('Confirming your enquiry and files…');
    const result = await apiRequest('markSubmissionReady', { leadId: session.id, uploadToken: session.uploadToken }, request);
    if (result.success !== true || result.verifiedDocCount !== files.length) throw new Error('File confirmation is incomplete. Please contact us with your enquiry reference.');
    return { id: session.id, fileCount: files.length };
  }

  function track(event, data) {
    // Never include names, contact details, addresses, messages or filenames.
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event, ...data });
      if (typeof window.gtag === 'function') window.gtag('event', event, data);
    }
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { makeLead, checkFiles, apiRequest, submitIntake };
  if (typeof document === 'undefined') return;

  const menu = document.querySelector('.menu');
  const navigation = document.querySelector('#main-navigation');
  function closeMenu() {
    navigation?.classList.remove('open');
    menu?.setAttribute('aria-expanded', 'false');
    menu?.setAttribute('aria-label', 'Open navigation');
  }
  menu?.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(isOpen));
    menu.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
  document.querySelectorAll('#main-navigation a').forEach(link => {
    if (link.getAttribute('href') === location.pathname) link.setAttribute('aria-current', 'page');
    link.addEventListener('click', closeMenu);
  });
  const chosenService = new URLSearchParams(location.search || '').get('service');
  const select = document.querySelector('#intake-service');
  if (select && chosenService && Array.from(select.options).some(option => option.value === chosenService)) select.value = chosenService;

  document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"]').forEach(link => link.addEventListener('click', () => {
    track(link.getAttribute('href').startsWith('tel:') ? 'phone_click' : 'email_click', { page_path: location.pathname });
  }));
  document.querySelectorAll('a[data-review-link]').forEach(link => link.addEventListener('click', () => {
    track('review_click', { page_path: location.pathname, link_location: link.dataset.reviewLink });
  }));

  document.querySelectorAll('.enquiry-form').forEach(form => {
    let busy = false;
    let session = {};
    let previousSignature = '';
    let previousFiles = [];
    let started = false;
    form.addEventListener('focusin', () => { if (!started) { track('form_start', { form_id: form.id }); started = true; } });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (busy || !form.checkValidity()) { if (!busy) form.reportValidity(); return; }
      const button = form.querySelector('button[type="submit"]');
      const status = form.querySelector('.form-status');
      const help = form.querySelector('.form-error-help');
      const originalText = button.textContent;
      const controls = Array.from(form.querySelectorAll('input, select, textarea'));
      const originallyDisabled = controls.map(control => control.disabled);
      const showStatus = (message, state = 'pending') => {
        status.hidden = false;
        status.dataset.state = state;
        status.textContent = message;
      };
      busy = true;
      button.disabled = true;
      button.textContent = 'Sending…';
      form.setAttribute('aria-busy', 'true');
      help.hidden = true;
      let lead;
      try {
        const data = new FormData(form);
        lead = makeLead(data, location.pathname);
        const files = Array.from(form.elements.namedItem('files')?.files || []);
        checkFiles(files);
        const signature = JSON.stringify(lead);
        if (signature !== previousSignature || files.length !== previousFiles.length || files.some((file, i) => file !== previousFiles[i])) {
          session = {}; previousSignature = signature; previousFiles = files;
        }
        controls.forEach(control => { control.disabled = true; });
        const result = await submitIntake(lead, files, session, showStatus);
        if (result.notificationDelivered) {
          showStatus(`Got it — we have received your enquiry. Reference: ${result.id}. We will be in touch shortly.`, 'success');
          help.hidden = true;
        } else {
          showStatus(`Your enquiry${result.fileCount ? ' and ' + result.fileCount + ' supporting file(s)' : ''} has been recorded. Reference: ${result.id}. Email delivery to our team is not confirmed. Please call 0403 126 276 or use the email link below to confirm your request.`, 'pending');
          help.hidden = false;
        }
        const emailLink = form.querySelector('.email-enquiry');
        if (emailLink) {
          const body = [`Enquiry reference: ${result.id}`, `Name: ${lead.name}`, `Phone: ${lead.phone}`, `Email: ${lead.email}`, `Service: ${lead.service}`, `Property: ${lead.siteAddress}`, `Urgency: ${lead.urgency}`, '', lead.message, '', 'Please attach any supporting files to this email.'].join('\n');
          emailLink.href = `mailto:info@alliancegroups.com.au?subject=${encodeURIComponent(lead._subject)}&body=${encodeURIComponent(body)}`;
        }
        track('enquiry_recorded', { form_id: form.id, service: lead.service, page_path: location.pathname });
      } catch (error) {
        const reference = session.id ? ` Reference: ${session.id}. Your enquiry is recorded, but completion is unconfirmed.` : '';
        const message = error.name === 'AbortError' ? 'The upload timed out. Please retry to resume or email your files.' : error.message || 'We could not complete your submission. Please contact us directly.';
        showStatus(message + reference, 'error');
        help.hidden = false;
        const emailLink = form.querySelector('.email-enquiry');
        if (emailLink && lead) {
          const body = [`Enquiry reference: ${session.id || 'unconfirmed'}`, `Name: ${lead.name}`, `Phone: ${lead.phone}`, `Email: ${lead.email}`, `Service: ${lead.service}`, `Property: ${lead.siteAddress}`, `Urgency: ${lead.urgency}`, '', lead.message, '', 'Please attach any supporting files to this email.'].join('\n');
          emailLink.href = `mailto:info@alliancegroups.com.au?subject=${encodeURIComponent(lead._subject)}&body=${encodeURIComponent(body)}`;
        }
        track('form_error', { form_id: form.id, stage: session.id ? 'files' : 'submission' });
      } finally {
        controls.forEach((control, i) => { control.disabled = originallyDisabled[i]; });
        busy = false; button.disabled = false; button.textContent = originalText;
        form.removeAttribute('aria-busy'); status.focus();
      }
    });
  });
})();
