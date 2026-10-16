// Alliance JARVIS voice intake v1: inbound-only, authenticated, and disabled by default.
// Nothing here originates a call, sends a customer message or approves work.
const PRIVATE = {'Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff'};
const reply=(payload,status=200)=>Response.json(payload,{status,headers:PRIVATE});
const tidy=(v,max=400)=>typeof v==='string'?v.trim().slice(0,max):'';
const EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function tokenMatches(given,expected) {
  if(typeof given!=='string'||!expected||expected.length<32) return false;
  const bytes=new TextEncoder();
  const [a,b]=await Promise.all([
    crypto.subtle.digest('SHA-256',bytes.encode(given)),
    crypto.subtle.digest('SHA-256',bytes.encode('Bearer '+expected))
  ]);
  const x=new Uint8Array(a),y=new Uint8Array(b);
  let diff=0;
  for(let i=0;i<x.length;i++) diff|=x[i]^y[i];
  return diff===0;
}

async function captureEnquiry(message,args,env) {
  const call=message.call;
  if(!call||call.type!=='inboundPhoneCall'||!/^[-\w]{8,128}$/.test(call.id||'')) {
    return {error:'Only verified inbound calls can create enquiries.'};
  }
  if(!args||args.callerConfirmedDetails!==true||args.callbackConsent!==true) {
    return {error:'Ask the caller to confirm their details and callback permission first.'};
  }
  const name=tidy(args.name,120),service=tidy(args.service,160);
  const description=tidy(args.description,3000),suburb=tidy(args.suburb,300);
  const email=tidy(args.email,254),urgency=tidy(args.urgency,80);
  // Prefer the number supplied by the phone provider. With withheld numbers,
  // accept an explicitly confirmed callback number spoken by the caller.
  const providerPhone=tidy(call.customer?.number||message.customer?.number,30);
  const phone=/^\+?[1-9]\d{7,14}$/.test(providerPhone)?providerPhone:
    args.confirmedCallbackNumber===true?tidy(args.callbackNumber,30):'';
  if(name.length<2||service.length<2||description.length<12||
      !/^\+?[0-9][0-9 ()-]{7,23}$/.test(phone)||
      (email&&!EMAIL.test(email))) return {error:'A valid name, phone, service and issue description are required.'};

  const now=Date.now(),id=crypto.randomUUID();
  const fingerprint='voice:'+call.id;
  let priority=35;
  if(/urgent|emergency|today|active/i.test(urgency+' '+description)) priority+=25;
  if(/asbestos|friable|silica|make.safe/i.test(service+' '+description)) priority+=12;
  if(suburb) priority+=8;
  try {
    const previous=await env.CRM_DB.prepare('SELECT lead_id FROM voice_calls WHERE call_id=?').bind(call.id).first();
    if(previous) return {result:JSON.stringify({captured:true,duplicate:true})};
    // D1 batch is transactional. The unique call_id prevents a replay from
    // creating a second lead even when webhooks arrive concurrently.
    await env.CRM_DB.batch([
      env.CRM_DB.prepare("INSERT INTO voice_calls (call_id,lead_id,received_ms,direction) VALUES (?,?,?,'inbound')").bind(call.id,id,now),
      env.CRM_DB.prepare("INSERT INTO leads (id,fingerprint,received_ms,updated_ms,source,name,email,phone,company,service,site_address,urgency,message,priority) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(id,fingerprint,now,now,'voice',name,email,phone,'',service,suburb,urgency,description,Math.min(priority,100)),
      env.CRM_DB.prepare('INSERT INTO lead_events (id,lead_id,actor,kind,detail,created_ms) VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(),id,'jarvis-voice','voice_intake','Inbound caller confirmed details and consented to callback.',now)
    ]);
    return {result:JSON.stringify({captured:true,duplicate:false})};
  } catch(error) {
    // A competing retry may have committed first. Reconcile before returning.
    try {
      const prior=await env.CRM_DB.prepare('SELECT lead_id FROM voice_calls WHERE call_id=?').bind(call.id).first();
      if(prior?.lead_id) return {result:JSON.stringify({captured:true,duplicate:true})};
    } catch {}
    console.error('Voice intake database operation failed.');
    return {error:'Enquiry could not be recorded. Please ask the caller to contact Alliance directly.'};
  }
}

export async function handleVoiceBridge(request,env) {
  if(request.method!=='POST') return reply({error:'Method not allowed.'},405);
  if(env.VOICE_BRIDGE_ENABLED!=='true'||!env.CRM_DB||
      typeof env.VOICE_WEBHOOK_TOKEN!=='string'||env.VOICE_WEBHOOK_TOKEN.length<32)
    return reply({error:'Voice intake not configured.'},503);
  if(!(await tokenMatches(request.headers.get('Authorization'),env.VOICE_WEBHOOK_TOKEN)))
    return reply({error:'Unauthorized.'},401);
  const contentType=request.headers.get('Content-Type')||'';
  if(!contentType.toLowerCase().includes('application/json')) return reply({error:'JSON required.'},415);
  if(Number(request.headers.get('Content-Length'))>16000) return reply({error:'Payload too large.'},413);
  const raw=await request.text();
  if(new TextEncoder().encode(raw).length>16000) return reply({error:'Payload too large.'},413);
  let data;
  try {data=JSON.parse(raw);}catch{return reply({error:'Invalid JSON.'},400);}
  const message=data?.message;
  if(!message||typeof message!=='object') return reply({error:'Invalid message.'},400);
  // Informational events must NEVER create a lead, even when they contain transcripts.
  if(message.type!=='tool-calls') return reply({received:true});
  const calls=message.toolCallList;
  if(!Array.isArray(calls)||calls.length<1||calls.length>3)
    return reply({error:'Invalid tool calls.'},400);
  const results=[];
  for(const entry of calls) {
    const toolCallId=tidy(entry?.id,128);
    if(!toolCallId) return reply({error:'Missing tool call ID.'},400);
    if(entry?.function?.name!=='capture_enquiry') {
      results.push({toolCallId,error:'Unsupported operation. No action taken.'});
      continue;
    }
    let args=entry.function.arguments;
    if(typeof args==='string'){try{args=JSON.parse(args);}catch{args=null;}}
    const outcome=await captureEnquiry(message,args,env);
    results.push({toolCallId,...outcome});
  }
  return reply({results});
}
