const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');

test('final homepage loads the production visual and unified delivery layers', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  assert.match(html, /\/css\/final-home\.css/);
  assert.match(html, /\/js\/final-home\.js/);
  assert.match(html, /\/js\/form-handler\.js/);
  assert.match(html, /When the building fails/);
  assert.match(html, /\/intake\//);
});

test('detailed intake uses the documented multipart FormSubmit path', () => {
  const html = fs.readFileSync('intake/index.html', 'utf8');
  assert.match(html, /action="https:\/\/formsubmit\.co\/info@alliancegroups\.com\.au"/);
  assert.match(html, /method="POST"/);
  assert.match(html, /enctype="multipart\/form-data"/);
  assert.match(html, /name="_next" value="https:\/\/www\.alliancegroups\.com\.au\/intake\/sent\.html"/);
  assert.doesNotMatch(html, /js\/form-handler\.js/);
});

test('legacy UI script no longer attaches its own form delivery listeners', () => {
  const source = fs.readFileSync('js/main.js', 'utf8');
  assert.doesNotMatch(source, /CONTACT FORM — live dispatch/);
  assert.doesNotMatch(source, /ASBESTOS ORDER FORM — live Formspree submission/);
  assert.match(source, /Form submission is intentionally centralized in js\/form-handler\.js/);
});

test('intake attachment guard enforces FormSubmit 10 MB total limit', () => {
  const source = fs.readFileSync('js/intake-final.js', 'utf8');
  assert.match(source, /10 \* 1024 \* 1024/);
  assert.match(source, /submit\.disabled = tooLarge/);
});