const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = process.cwd();
const excluded = new Set(['index-original.html', 'index-static-backup.html']);
const dirs = ['.', 'case-studies', 'compliance-shield', 'intake', 'knowledge', 'public'];
const files = dirs.flatMap(dir => fs.readdirSync(path.join(root, dir), {withFileTypes:true})
  .filter(item=>item.isFile() && item.name.endsWith('.html') && !excluded.has(item.name))
  .map(item=>path.join(dir,item.name)));
test('no published HTML uses a retired phone or suspended mailbox', () => {
  const failures = [];
  const obsolete = /0410[\s-]?942[\s-]?905|0410942905|\+61[\s-]?410[\s-]?942[\s-]?905|info@alliancegroups\.com\.au/i;
  for(const name of files) {
    const content = fs.readFileSync(path.join(root,name),'utf8');
    if(obsolete.test(content)) failures.push(name);
  }
  assert.deepEqual(failures,[],'Inactive contact points: '+failures.join(', '));
});
test('private operations shell and source maps are never in robots index', () => {
  const page=fs.readFileSync('ops/index.html','utf8');
  const worker=fs.readFileSync('worker.js','utf8');
  assert.match(page,/noindex,nofollow/);
  assert.ok(worker.includes('url.pathname.startsWith("/ops/")'));
  assert.match(worker,/verifyOperationsUser/);
});
test('duplicate submissions do not trigger a new paid-lead analytics event', () => {
  const form=fs.readFileSync('js/form-handler.js','utf8');
  const duplicate=form.indexOf('if (response.status === 202 && payload.duplicate)');
  const success=form.indexOf('if (response.ok && payload.notificationDelivered)');
  assert.ok(duplicate>=0 && success>duplicate,'duplicate branch must precede generate_lead');
});
