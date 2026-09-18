(() => {
  'use strict';

  const form = document.querySelector('[data-detailed-intake]');
  if (!form) return;

  const fileInputs = Array.from(form.querySelectorAll('input[type="file"]'));
  const fileStatus = form.querySelector('[data-file-status]');
  const alertBox = form.querySelector('[data-intake-alert]');
  const submit = form.querySelector('button[type="submit"]');
  const MAX_TOTAL = 10 * 1024 * 1024;

  function totalFileBytes() {
    return fileInputs.reduce((total, input) => {
      return total + Array.from(input.files || []).reduce((sum, file) => sum + file.size, 0);
    }, 0);
  }

  function formatBytes(bytes) {
    if (!bytes) return '0 MB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  }

  function updateFileState() {
    const bytes = totalFileBytes();
    const count = fileInputs.reduce((n, input) => n + (input.files ? input.files.length : 0), 0);

    if (fileStatus) {
      fileStatus.textContent = count
        ? count + ' file' + (count === 1 ? '' : 's') + ' selected · ' + formatBytes(bytes) + ' / 10 MB total'
        : 'No files selected · 10 MB total limit';
    }

    const tooLarge = bytes > MAX_TOTAL;
    if (alertBox) {
      alertBox.style.display = tooLarge ? 'block' : 'none';
      if (tooLarge) {
        alertBox.textContent = 'Attachments total ' + formatBytes(bytes) + '. FormSubmit accepts up to 10 MB total, so please remove or compress one or more files before submitting.';
      }
    }
    if (submit) submit.disabled = tooLarge;
    return !tooLarge;
  }

  fileInputs.forEach((input) => input.addEventListener('change', updateFileState));
  updateFileState();

  form.addEventListener('submit', (event) => {
    if (!updateFileState()) {
      event.preventDefault();
      return;
    }

    if (!form.checkValidity()) {
      event.preventDefault();
      form.reportValidity();
      return;
    }

    if (submit) {
      submit.disabled = true;
      submit.textContent = 'Sending property details…';
    }
  });
})();