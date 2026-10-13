# Alliance Command: connected operations foundation (V1)

This module extends the EXISTING Alliance website, rather than replacing it. **Never expose customer information in public static HTML, analytics or client-side localStorage.**

## What's implemented in this branch
- `/api/intake` can preserve *real* website enquiries in Cloudflare D1 before attempting an operations-only email notification. Identical submissions within a short interval are deduplicated; no fabricated leads or seed rows.
- `/ops/` is an INTERNAL dashboard, not a public customer portal. It is fail-closed unless a Cloudflare Access JWT is verified against the configured team certs, audience and permitted email addresses.
- `/api/internal/summary`, `/api/internal/leads`, `/api/internal/leads/:id` and `/api/internal/drafts` are protected by that same access check.
- Leads can be triaged, assigned a route, estimated quote value, and given a next action. Each update is logged. Follow-up email/SMS content can ONLY be saved as a **draft**; no endpoint sends it.
- Internal PDF/JPEG/PNG evidence can be stored in a PRIVATE R2 bucket (10 MB per file) and downloaded only through an authenticated Worker endpoint.
- Existing website/static content and Firebase/email fallback remain in place.

## Provisioning gates before release
1. In the correct Cloudflare account, create D1 database `alliance-crm` (or another chosen name). Execute `wrangler d1 execute alliance-crm --file=operations/schema.sql --remote`. Inspect records first: the SQL creates tables, **not leads**.
2. In `wrangler.live.jsonc`, add a D1 binding `CRM_DB` with the actual returned `database_id`, and an R2 private bucket binding `CRM_FILES` if document management is wanted. **Do not invent IDs or publish this example as live configuration.**
3. Create Cloudflare Access self-hosted application covering `/ops/*` and `/api/internal/*`. Set Worker environment variables `ACCESS_TEAM_DOMAIN` (e.g. your-team.cloudflareaccess.com), `ACCESS_AUD` (app AUD tag), and `ACCESS_ALLOWED_EMAILS` (comma-separated permitted logins). Access policies must restrict the same list; the Worker independently validates cryptographic signatures, issuer and audience.
4. Verify `EMAIL` send binding, sender domain and destination verification and `la.asbestos@gmail.com` notifications; retain Firebase as fallback. Never claim the email was received until the inbox is checked.
5. Confirm actual production origin (the live homepage currently differs from this repository); snapshot/rollback before any deployment. Existing deploy workflow deliberately requires a manual `YES` release.
6. Run `npm test`, `npm run build:cloudflare`, Wrangler dry-run and a preview browser session with mobile and desktop. Submit one clearly marked controlled test into a nonproduction database, then clean it up. No test records in the real-lead pipeline.
7. For genuine lead acceptance, test the phone CTA, both forms, D1 write, mail acceptance, Firebase fallback when configured, deduplication, dashboard authentication, draft-only policy, PDF access controls and audit trail.

## Design decisions
- Owner-operated workflow; dashboard routes are `review`, `direct`, `managed`, `referral`.
- Priority score is a triage *hint*, not a suitability or legal/compliance determination. Never automatically accept high-risk asbestos works.
- Client SMS/email remains draft-only until an owner independently sends it from their chosen account.
- Compliance paperwork, Form 65 filing and clearance certification require qualified review and the applicable Queensland statutory processes. The dashboard stores working evidence and does not create regulatory approvals.
- The site must not state a fictitious address, jobs, reviews, clearance authority, availability or guarantees.
- JARVIS/third-party AI should connect through a separate authenticated service integration; never expose CRM DB or Access token to a public chatbot. No AI agent credentials are stored in Git.
- Database/D1, R2 and Access are REQUIRED for the complete internal module. Without bindings it displays an unavailable response rather than a fake CRM.

## Outstanding for production V2
Customer evidence upload with revocable one-time authorisation, inbound email syncing and associated deduplication, granular per-role permissions, payable invoices, licensed regulator workflow templates, appointment integration, full SLA/financial dashboards, and a verified end-to-end live release. These are not falsely represented as finished.
