import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import worker from '../worker.js';
import {handleVoiceBridge} from '../voice/bridge.js';

if(!globalThis.crypto) globalThis.crypto=webcrypto;
const SECRET='test-voice-credential-abcdefghijklmnopqrstuvwxyz';
function fakeDb() {
  const records=new Map(),leads=[];
  return {
    records,leads,
    prepare(sql) {
      let args=[];
      return {
        sql, get args(){return args;},
        bind(...values){args=values;return this;},
        async first(){if(sql.startsWith('SELECT lead_id FROM voice_calls'))return records.has(args[0])?{lead_id:records.get(args[0])}:null;return null;}
      };
    },
    async batch(statements){
      const call=statements[0].args[0];
      if(records.has(call)) throw Error('duplicate call');
      assert.match(statements[0].sql,/INSERT INTO voice_calls/);
      assert.match(statements[1].sql,/INSERT INTO leads/);
      assert.match(statements[2].sql,/INSERT INTO lead_events/);
      records.set(call,statements[0].args[1]);
      leads.push({id:statements[1].args[0],source:statements[1].args[4],phone:statements[1].args[7]});
    }
  };
}
function event(callId='call-123456789',type='inboundPhoneCall') {
  return {message:{type:'tool-calls',call:{id:callId,type,customer:{number:'+61400123456'}},toolCallList:[{
    id:'tool-01',type:'function',function:{name:'capture_enquiry',arguments:{
      name:'Actual Caller',service:'Asbestos inspection',suburb:'Bray Park',
      description:'Discovered suspected asbestos during renovations.',
      urgency:'urgent',callerConfirmedDetails:true,callbackConsent:true
    }}
  }]}};
}
function send(payload,env,{token=SECRET,path='/api/voice/events'}={}) {
  const req=new Request('https://www.alliancegroups.com.au'+path,{
    method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
    body:JSON.stringify(payload)
  });
  return worker.fetch(req,env);
}
test('voice intake cannot run without explicit enablement and credentials',async()=>{
  const res=await handleVoiceBridge(new Request('https://example.test/api/voice/events',{method:'POST'}),{CRM_DB:fakeDb()});
  assert.equal(res.status,503);
});
test('voice bridge rejects unauthenticated calls without saving personal information',async()=>{
  const db=fakeDb(),env={CRM_DB:db,VOICE_BRIDGE_ENABLED:'true',VOICE_WEBHOOK_TOKEN:SECRET};
  const res=await send(event(),env,{token:'wrong'});
  assert.equal(res.status,401);
  assert.equal(db.leads.length,0);
});
test('authenticated caller confirmation creates ONE real inbound lead with provider phone',async()=>{
  const db=fakeDb(),env={CRM_DB:db,VOICE_BRIDGE_ENABLED:'true',VOICE_WEBHOOK_TOKEN:SECRET};
  const first=await send(event(),env);
  assert.equal(first.status,200);
  assert.deepEqual((await first.json()).results[0].result,'{"captured":true,"duplicate":false}');
  assert.equal(db.leads.length,1);
  assert.equal(db.leads[0].source,'voice');
  assert.equal(db.leads[0].phone,'+61400123456');
  const repeat=await send(event(),env);
  assert.equal((await repeat.json()).results[0].result,'{"captured":true,"duplicate":true}');
  assert.equal(db.leads.length,1);
});
test('an outbound call, unconfirmed enquiry, informational event and unsupported tool cannot create a lead',async()=>{
  const db=fakeDb(),env={CRM_DB:db,VOICE_BRIDGE_ENABLED:'true',VOICE_WEBHOOK_TOKEN:SECRET};
  const outbound=await send(event('call-222222222','outboundPhoneCall'),env);
  assert.match((await outbound.json()).results[0].error,/inbound/);
  const unconfirmed=event('call-333333333');
  unconfirmed.message.toolCallList[0].function.arguments.callbackConsent=false;
  assert.match((await (await send(unconfirmed,env)).json()).results[0].error,/permission/);
  const informational=await send({message:{type:'end-of-call-report',call:{id:'call-444444444'},artifact:{transcript:'Sensitive caller data'}}},env);
  assert.deepEqual(await informational.json(),{received:true});
  const unsupported=event('call-555555555');
  unsupported.message.toolCallList[0].function.name='send_sms';
  assert.match((await (await send(unsupported,env)).json()).results[0].error,/Unsupported/);
  assert.equal(db.leads.length,0);
});
test('Vapi adapter refuses oversized bodies and malformed JSON',async()=>{
  const env={CRM_DB:fakeDb(),VOICE_BRIDGE_ENABLED:'true',VOICE_WEBHOOK_TOKEN:SECRET};
  const request=(body)=>new Request('https://example.test/api/voice/events',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+SECRET},body});
  assert.equal((await handleVoiceBridge(request('z'.repeat(16001)),env)).status,413);
  assert.equal((await handleVoiceBridge(request('{bad'),env)).status,400);
});
