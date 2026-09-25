const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');

const source = fs.readFileSync('js/form-handler.js', 'utf8');
const functionSource = fs.readFileSync('firebase-backend/functions/index.js', 'utf8');

test('uses the private Firebase lead record as the only emergency intake route', () => {
  assert.match(source, /fetch\(FIREBASE_FUNCTION_URL/, 'Firebase intake call must remain present');
  assert.doesNotMatch(source, /formsubmit\.co/, 'A suspended mailbox must not receive form submissions through FormSubmit');
  assert.match(source, /Your request has been recorded/, 'The emergency acknowledgement must only claim lead recording');
  assert.match(source, /0410 942 905/, 'The emergency callback number must remain visible');
  assert.match(source, /0403 126 276/, 'The general callback number must remain visible');
});

test('does not claim email delivery while Workspace is unavailable', () => {
  assert.doesNotMatch(source, /We have received your property details/, 'The normal receipt copy must not be shown during emergency mode');
  assert.match(source, /not currently available/, 'The acknowledgement must disclose that email notifications are unavailable');
});

test('keeps a saved lead available when the email notification cannot be sent', () => {
  assert.match(functionSource, /res\.status\(202\)\.json\(/, 'The function must acknowledge a saved lead without claiming email delivery');
  assert.match(functionSource, /notification_status: "failed"/, 'The failed notification state must remain recorded');
});
