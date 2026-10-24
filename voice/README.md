# JARVIS Voice: phase-one inbound bridge (not deployed)

This is a **disabled-by-default** Vapi webhook adapter that records only a caller-confirmed, genuine **inbound** enquiry in the EXISTING Alliance Cloudflare D1 `leads` table. It never originates calls, sends SMS/email, auto-schedules appointments, produces transcripts, or authorises works.

## Deployment prerequisites (not yet completed)
1. Verify the LIVE Cloudflare origin before *any* Worker deployment. The live site may differ from this GitHub branch. Keep a rollback and do not activate GitHub's deploy workflow.
2. Confirm that `CRM_DB` is bound to the real, access-controlled Alliance CRM and that `operations/schema.sql` is installed.
3. Run the additive `voice/schema.sql` migration against the verified D1 database. It makes **no sample leads**.
4. Create a dedicated Australian test number/provider account only **after owner approves charges and the full dialling configuration**. Do not port Alliance's public business number.
5. In Vapi, create an org-managed Bearer Token credential (at least 32 random characters) and attach via `server.credentialId` on a saved assistant or tool; use its server URL `https://<verified-live-origin>/api/voice/events`. Do not put secrets in Git or browser HTML. **Beware Vapi's request-supplied inline server URL credential withholding**.
6. Set matching Cloudflare Worker secret `VOICE_WEBHOOK_TOKEN` and Worker environment variable `VOICE_BRIDGE_ENABLED=true` only after staging integration passes. Disabled or unprovisioned requests return 503; invalid authorization returns 401.
7. Configure Vapi function tool `capture_enquiry` and `serverMessages:['tool-calls','end-of-call-report']`; keep all other tools such as SMS, outbound calls, quoting, payment, and transfers disabled until individually designed and approved.

## `capture_enquiry` model-visible arguments
```json
{
  "name": "actual caller-confirmed name",
  "service": "service required",
  "suburb": "property suburb",
  "description": "caller's own problem description (12+ characters)",
  "urgency": "timeframe",
  "email": "optional caller-supplied email",
  "callbackConsent": true,
  "callerConfirmedDetails": true,
  "callbackNumber": "caller-stated phone number if CLI unavailable",
  "confirmedCallbackNumber": false
}
```

The Vapi webhook supplies a separate `message.call.id`, `message.call.type='inboundPhoneCall'` and `message.call.customer.number`. The server validates the claimed call direction and uses provider metadata for callback number when possible. **Call metadata is trusted only because the webhook is authenticated.** Withheld calling numbers require explicit spoken confirmation of callback number.

Call ID is unique in `voice_calls`, and recording the call, lead, and audit event uses a transactional D1 batch. Retries for the same call return `duplicate:true`, not a second lead. `end-of-call-report` is acknowledged but does NOT create a lead or save recordings/transcripts. Logs do not include customer text.

## Prompt instructions for inbound receptionist
> "Hello, I'm the Alliance Building & Hazmat AI assistant. I can take the details of your enquiry or arrange for a team member to call you. This is an AI assistant."

Ask for name, callback number, location/suburb, type of work and urgency. **Do not claim asbestos is present or absent**, offer regulated advice, guarantee availability, quote work, pretend WHSQ approval exists, or request sensitive government identifiers. Confirm the information and get callback consent aloud before invoking `capture_enquiry`. If caller will not consent, advise them to contact Alliance by an existing published contact method. Urgent physical danger: ask caller to keep clear and get emergency services / qualified human advice, not an AI clearance assessment.

## Required acceptance tests before enablement
- `npm test` passes alongside existing CRM and intake tests; test credentials are synthetic.
- Confirm no production phone calls or paid services created by this PR.
- After owner authorises test-account spend: 20 controlled inbound calls on owned numbers, duplicate-webhook replay, consent declined, spoofed authorization, 16KB payload guard, caller with withheld ID, failed D1 binding, callback escalation, data retention, and a real authenticated dashboard check.
- Keep outbound campaigns OFF until consent/suppression list, ACMA calling rules, number provisioning, approved contact list and per-campaign spending authority are independently verified.

## References
- https://docs.vapi.ai/server-url/server-authentication
- https://docs.vapi.ai/server-url/events
- https://docs.vapi.ai/tools/custom-tools
