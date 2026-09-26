const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
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

test('detailed intake does not submit to the suspended mailbox', () => {
  const html = fs.readFileSync('intake/index.html', 'utf8');
  assert.match(html, /data-emergency-intake/);
  assert.doesNotMatch(html, /formsubmit\.co/);
  assert.doesNotMatch(html, /intake\/sent\.html/);
  assert.match(html, /js\/intake-final\.js/);
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

test('production homepage uses documented site records without a false before-and-after claim', () => {
  execFileSync('node', ['scripts/build-cloudflare.mjs'], { stdio: 'pipe' });
  const html = fs.readFileSync('dist/index.html', 'utf8');

  assert.match(html, /Selected site condition and controlled-work records/);
  assert.doesNotMatch(html, /Before and after roof project comparison/);
  assert.doesNotMatch(html, /before-after-roof-1-before\.jpg/);
  assert.doesNotMatch(html, /site-investigation-img9692\.jpg/);
  assert.doesNotMatch(html, /project-1\.jpg/);
  assert.doesNotMatch(html, /Waterproofing and building recovery/);
  assert.doesNotMatch(html, /Inspection, evidence and documented outcome/);
});
