const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');

const source = fs.readFileSync('js/form-handler.js', 'utf8');
const workerSource = fs.readFileSync('worker.js', 'utf8');
const functionSource = fs.readFileSync('firebase-backend/functions/index.js', 'utf8');

test('routes public enquiry forms through the responding production Firebase handler', () => {
  assert.match(source, /const ENDPOINT = "https:\/\/us-central1-alliance-hub-5ed2c\.cloudfunctions\.net\/submitLead"/);
  assert.match(source, /fetch\(ENDPOINT/);
  assert.doesNotMatch(source, /formsubmit\.co/);
  assert.match(source, /notificationDelivered/);
  assert.match(source, /Enquiry sent/);
  assert.doesNotMatch(source, /0410 942 905/);
  assert.match(source, /0403 126 276/);
  assert.match(source, /lead_recorded_unnotified/);
  assert.match(source, /Online attachments are temporarily unavailable/);
});

test('Cloudflare Worker remains an independent fallback path with Firebase backup', () => {
  assert.match(workerSource, /env\.EMAIL\.send/);
  assert.match(workerSource, /la\.asbestos@gmail\.com/);
  assert.match(workerSource, /archiveLead/);
  assert.match(workerSource, /notificationDelivered: true/);
});
test('keeps a saved lead available when a legacy Firebase email notification cannot send', () => {
  assert.match(functionSource, /res\.status\(202\)\.json\(/);
  assert.match(functionSource, /notification_status: "failed"/);
});

test('does not show a false success when both delivery paths fail', () => {
  assert.match(source, /We could not send your enquiry online/);
  assert.match(workerSource, /status: 502/);
});
