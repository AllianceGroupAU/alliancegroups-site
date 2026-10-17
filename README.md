# Alliance Building & Hazmat Group | Alliance Website

> **For JARVIS and other bots:** The actual ChatGPT-built site currently visible on `alliancegroups.com.au` has been recovered under [`live-site/`](live-site/). Edit and test **that directory**, not the root-level rebuild. See [AGENTS.md](AGENTS.md) and [BOT_SITE_EDITING.md](BOT_SITE_EDITING.md). GitHub changes are not publicly deployed until the Cloudflare cutover is verified.

The public site at https://www.alliancegroups.com.au/ was developed and published through a **ChatGPT-led workflow**. This repository contains Alliance's multi-page public website, Cloudflare Worker intake, Firebase archive option and the proposed private Alliance Command operations module.

**Deployment target: Cloudflare (NOT Vercel).** Vercel references in old project artifacts are historical and must not be treated as the active deployment pipeline.

## Current source layout

- `index.html`, `*.html`, `css/`, `js/`, `images/`, `intake/`, `knowledge/`: public website and service pages.
- `worker.js`: Cloudflare Worker for public `/api/intake` and private operations routing.
- `wrangler.live.jsonc`: configured Worker target named `alliance-main-site`; its routes include apex and www for `alliancegroups.com.au`. **The configuration alone is not proof this is the current live origin. Confirm in Cloudflare before deploying.**
- `scripts/build-cloudflare.mjs`: assembles public Cloudflare static assets into `dist/`; Cloudflare Pages supports `dist/_worker.js`; standalone Worker uses `worker.js` and ignores `_worker.js` in uploaded assets.
- `firebase-backend/`: legacy/optional Firestore and notifications backend; do not assume this is deployed or delivering emails.
- `ops/`, `operations/`: proposed Cloudflare Access-protected internal CRM. Private D1/R2/Access provisioning required. No real CRM is live until verified.

## Validate changes without publishing

```bash
npm test
npm run build:cloudflare
npx wrangler@4.149.0 deploy --config wrangler.live.jsonc --dry-run
```

The GitHub **Site integrity** workflow runs syntax checks, unit tests, artifact checks and a Cloudflare dry run. A passing CI result is **not** live-site verification.

## Publishing guardrails

1. Compare the actual ChatGPT-produced live Cloudflare site and routes against the GitHub build. The live site has previously differed from the repository and must not be overwritten blindly.
2. Check Cloudflare zone, account, active Worker/Pages deployment, custom domains, bindings and a rollback snapshot.
3. Verify `/api/intake` end-to-end with one clearly labelled controlled enquiry in nonproduction, including saved record and *inbox* receipt. Public customer enquiries must not silently disappear.
4. Confirm phone click, website assets, mobile UX, redirects, page links, licensing/trust claims and analytics.
5. Only then use the manually gated GitHub `Validate and Deploy Cloudflare Worker` workflow, supplying its explicit `YES` confirmation and required Cloudflare credentials. PR merges **do not** publish the live site.
6. Check production immediately following a deliberate deployment. No domain or DNS changes without need and authorisation.

See [operations/README.md](operations/README.md) for Alliance Command provisioning and security. Every client email or SMS stays a **draft** until manually approved and sent by the owner. No seeded or fabricated lead records.
