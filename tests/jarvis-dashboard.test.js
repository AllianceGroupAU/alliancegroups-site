import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync('ops/index.html','utf8');
const app=readFileSync('ops/app.js','utf8');

test('JARVIS command dashboard exposes each planned view through one navigation',()=>{
  const views=['today','work','agents','clients','schedule','money','documents','knowledge','system'];
  for(const view of views) {
    assert.match(html,new RegExp('data-view="'+view+'-view"'));
    assert.match(html,new RegExp('id="'+view+'-view"'));
  }
});

test('unconnected systems are clearly unavailable instead of showing fabricated health',()=>{
  assert.match(html,/Schedule[\s\S]*?Not connected/);
  assert.match(html,/Payments and accounting[\s\S]*?Not connected/);
  assert.match(html,/JARVIS agent runtime[\s\S]*?Not verified/);
  assert.match(html,/No balances or collections are inferred/);
});

test('CRM status changes only after the authenticated records API responds',()=>{
  assert.match(app,/Promise\.all\(\[api\('summary'\),api\('leads'/);
  assert.match(app,/setCrmStatus\(true,'Connected'\)/);
  assert.match(app,/setCrmStatus\(false,'Unavailable'\)/);
});
