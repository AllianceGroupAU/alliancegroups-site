const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');

const read = (path) => fs.readFileSync(path, 'utf8');

test('Cloudflare build includes the intake worker', () => {
  const build = read('scripts/build-cloudflare.mjs');
  assert.match(build, /copyFile\(path\.join\(root, 'worker\.js'\), path\.join\(out, '_worker\.js'\)\)/);
  assert.match(read('worker.js'), /url\.pathname === "\/api\/intake"/);
});

test('quick enquiry requires callback details but not an email address', () => {
  const home = read('index.html');
  assert.match(home, /href="#enquiry">Request a callback/);
  assert.match(home, /id="quick-name" name="name"[^>]*required/);
  assert.match(home, /id="quick-phone" name="phone"[^>]*required/);
  assert.match(home, /id="quick-message" name="message"[^>]*required/);
  assert.doesNotMatch(home, /id="quick-email"[^>]*required/);
  assert.doesNotMatch(home, /id="quick-service"[^>]*required/);
});

test('detailed intake enhancement connects to the actual form', () => {
  assert.match(read('intake/index.html'), /data-emergency-intake/);
  assert.match(read('js/intake-final.js'), /data-emergency-intake/);
  assert.match(read('js/form-handler.js'), /Online attachments are temporarily unavailable/);
});

test('contact number, inactive inbox and delivery metrics are consistent', () => {
  for (const path of ['index.html', 'intake/index.html', 'llms.txt']) {
    const contents = read(path);
    assert.doesNotMatch(contents, /0410 942 905|info@alliancegroups\.com\.au/);
    assert.match(contents, /0403 126 276/);
  }
  assert.match(read('firebase-backend/functions/index.js'), /INTAKE_NOTIFICATION_TO/);
  assert.doesNotMatch(read('firebase-backend/functions/index.js'), /to: "info@alliancegroups\.com\.au"/);
  assert.match(read('js/form-handler.js'), /lead_recorded_unnotified/);
  assert.match(read('js/final-home.js'), /contact_phone_click/);
});
