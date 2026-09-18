const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');

const source = fs.readFileSync('js/form-handler.js', 'utf8');

test('does not treat Firebase logging as proof that the intake email was delivered', () => {
  const firebaseBlock = source.slice(
    source.indexOf('// 2. Secondary: Cloud function lead logging'),
    source.indexOf('if (submittedSuccessfully)')
  );

  assert.ok(firebaseBlock.includes('fetch(FIREBASE_FUNCTION_URL'), 'Firebase logging call should remain present');
  assert.equal(
    firebaseBlock.includes('submittedSuccessfully = true'),
    false,
    'Firebase logging must not set the customer-facing delivery success flag'
  );
});

test('requires the FormSubmit response to be successful before showing Received', () => {
  assert.match(source, /if \(fsRes\.ok\)/, 'FormSubmit HTTP status must be checked');
  assert.match(source, /submittedSuccessfully = true/, 'confirmed FormSubmit delivery should set success');
});
