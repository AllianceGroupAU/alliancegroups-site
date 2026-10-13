import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import fs from 'node:fs';
import worker, {handleIntake, verifyOperationsUser} from '../worker.js';

const mockLead = {name:'Enquiry Test',phone:'0400000000',email:'private@example.test',service:'Roofing',message:'The roof is leaking into the hallway.'};
function request(data) {return new Request('https://www.alliancegroups.com.au/api/intake',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});}
function fakeCrm() {
  let record = null, audit = 0, notification = '';
  return {
    records(){return {record,audit,notification};},
    prepare(sql) {
      let values=[];
      return {
        bind(...args){values=args;return this;},
        async first(){if(sql.startsWith('SELECT id,notification_status'))return record?{id:record.id,notification_status:notification}:null;return null;},
        async run(){
          if(sql.startsWith('INSERT INTO leads'))record={id:values[0],fingerprint:values[1],phone:values[7],message:values[12]};
          if(sql.startsWith('INSERT INTO lead_events'))audit++;
          if(sql.startsWith('UPDATE leads SET notification_status')) notification=values[0];
          return {success:true};
        }
      };
    }
  };
}
test('creates a genuine private D1 lead and never writes a fake record',async()=>{
  const db=fakeCrm();
  let sent=0;
  const env={CRM_DB:db,EMAIL:{send:async()=>{sent++;return {messageId:'accepted-not-delivered'};}}};
  const fallback=async()=>{throw Error('Firebase fallback must not run when D1 stored the lead');};
  const response=await handleIntake(request(mockLead),env,fallback);
  assert.equal(response.status,200);
  assert.equal(db.records().record.phone,mockLead.phone);
  assert.equal(db.records().audit,1);
  assert.equal(db.records().notification,'accepted');
  assert.equal(sent,1);
  assert.equal((await response.json()).notificationDelivered,true);
});
test('does not create duplicate leads or send a second alert for same details',async()=>{
  const db=fakeCrm();
  let sent=0;
  const env={CRM_DB:db,EMAIL:{send:async()=>{sent++;return {messageId:'accepted'};}}};
  await handleIntake(request(mockLead),env,async()=>{throw Error('fallback used');});
  const repeat=await handleIntake(request(mockLead),env,async()=>{throw Error('fallback used');});
  const json=await repeat.json();
  assert.equal(repeat.status,202);
  assert.equal(json.duplicate,true);
  assert.equal(db.records().audit,1);
  assert.equal(sent,1);
});
test('unconfigured private operations cannot expose customer records',async()=>{
  const env={ASSETS:{fetch:async()=>new Response('Should not serve')}};
  for(const url of ['/ops/','/api/internal/leads','/api/internal/drafts']){
    const response=await worker.fetch(new Request('https://www.alliancegroups.com.au'+url),env);
    assert.equal(response.status,403,url);
    assert.equal(response.headers.get('Cache-Control'),'no-store, private');
  }
});
test('Cloudflare Access JWT must have a valid RSA signature, issuer, audience and owner email',async()=>{
  const {publicKey,privateKey}=await webcrypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
  const key={...(await webcrypto.subtle.exportKey('jwk',publicKey)),kid:'test-key',alg:'RS256'};
  const enc=(s)=>Buffer.from(s).toString('base64url');
  async function token(email='owner@example.test',aud='ops-app'){
    const head=enc(JSON.stringify({alg:'RS256',kid:'test-key'}));
    const payload=enc(JSON.stringify({iss:'https://alliance.cloudflareaccess.com',aud:[aud],email,exp:Math.floor(Date.now()/1000)+300}));
    const signature=Buffer.from(await webcrypto.subtle.sign('RSASSA-PKCS1-v1_5',privateKey,new TextEncoder().encode(head+'.'+payload))).toString('base64url');
    return head+'.'+payload+'.'+signature;
  }
  const env={ACCESS_TEAM_DOMAIN:'alliance.cloudflareaccess.com',ACCESS_AUD:'ops-app',ACCESS_ALLOWED_EMAILS:'owner@example.test'};
  const certs=async()=>Response.json({keys:[key]});
  const req=(jwt)=>new Request('https://www.alliancegroups.com.au/ops/',{headers:{'Cf-Access-Jwt-Assertion':jwt}});
  assert.equal((await verifyOperationsUser(req(await token()),env,certs)).email,'owner@example.test');
  assert.equal(await verifyOperationsUser(req(await token('stranger@example.test')),env,certs),null);
  assert.equal(await verifyOperationsUser(req(await token('owner@example.test','wrong-app')),env,certs),null);
  const good=await token();
  assert.equal(await verifyOperationsUser(req(good.slice(0,-3)+'abc'),env,certs),null);
});
test('website has no seeded CRM records and no automatic client sending',()=>{
  const schema=fs.readFileSync('operations/schema.sql','utf8');
  const src=fs.readFileSync('worker.js','utf8');
  assert.doesNotMatch(schema,/INSERT\s+INTO\s+leads\s*\(/i);
  assert.match(src,/status:"draft",sent:false/);
  assert.match(fs.readFileSync('ops/index.html','utf8'),/Never sent automatically/);
  assert.match(fs.readFileSync('scripts/build-cloudflare.mjs','utf8'),/'ops'/);
});
