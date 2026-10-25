(() => {
  'use strict';

  const form = document.querySelector('[data-emergency-intake], [data-detailed-intake]');
  if (!form) return;

  const fileInputs = Array.from(form.querySelectorAll('input[type="file"]'));
  const fileStatus = form.querySelector('[data-file-status]');
  const alertBox = form.querySelector('[data-intake-alert]');
  const submit = form.querySelector('button[type="submit"]');
  const MAX_TOTAL = 200 * 1024 * 1024; // 10 files x 20MB

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

    if (fileStatus && fileInputs.length && fileInputs.every((input) => input.disabled)) {
      fileStatus.textContent = "Online attachments are unavailable. Describe the evidence and arrange sharing after contact.";
    } else if (fileStatus) {
      fileStatus.textContent = count
        ? count + ' file' + (count === 1 ? '' : 's') + ' selected · ' + formatBytes(bytes) + ' total (10 files, 20 MB each max)'
        : 'No files selected · up to 10 JPG, PNG or PDF files, 20 MB each';
    }

    const files = fileInputs.flatMap(input => Array.from(input.files || []));
    const tooLarge = bytes > MAX_TOTAL || files.length > 10 || files.some(file => !['image/jpeg', 'image/png', 'application/pdf'].includes(file.type) || file.size > 20 * 1024 * 1024 || file.size <= 0);
    if (alertBox) {
      alertBox.style.display = tooLarge ? 'block' : 'none';
      if (tooLarge) {
        alertBox.textContent = 'Attach up to 10 JPG, PNG or PDF files, each no larger than 20 MB.';
      }
    }
    if (submit) submit.disabled = tooLarge;
    return !tooLarge;
  }

  fileInputs.forEach((input) => input.addEventListener('change', updateFileState));
  updateFileState();

})();
