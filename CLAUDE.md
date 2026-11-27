# Alliance Group: single operating file

Read this first. It is the one place that records what is true about the Alliance website and what is still open, so the owner does not have to re-explain it to each new chat or bot. `AGENTS.md` holds the standing rules; this file holds the current state.

**Keep it current.** At the end of any session that changes something, or learns something that contradicts this file, update the relevant section and add a line to the log at the bottom. Record only what you checked yourself, and say how you checked it. If you are repeating something another session reported, say so.

This repository is public. Do not put secrets, tokens, customer details or security settings in this file.

## The one repository

`AllianceGroupAU/alliancegroups-site` is the home for all website and indexing work. Do not start new repositories or keep work in a chat's own files: anything worth keeping is committed here on a branch with a pull request.

## What actually serves alliancegroups.com.au

Checked 11–27 November 2026 by reading the deployed Worker code, the zone's Worker routes and the KV namespace through the Cloudflare connector (read-only), and by requesting the public site.

- The Cloudflare Worker `alliance-main-site` (last modified 1 November 2026) serves every public page from a KV namespace bound as `SITE`. The account's only KV namespace is titled `alliance-preview-20261031`. Zone routes confirm it: both the apex and `www` hosts route to `alliance-main-site`, except `/api/*`, which goes to a separate intake Worker.
- **The live pages are not in this repository.** The KV namespace holds 376 keys: 65 HTML pages, 8 JavaScript files, 6 CSS files, about 270 images, 2 PDFs and a few text files. Every key is an ordinary public site file.
- **The deployed Worker code is not in this repository either.** The root `worker.js` is an older relative of it without the KV page serving.
- `www.alliancegroups.com.au` redirects (301) to `alliancegroups.com.au`. The apex is the canonical host. The live `robots.txt` already points at `https://alliancegroups.com.au/sitemap.xml`.
- Exporting the live pages into this repository is not practical through a chat session: the connector returns every result into the conversation. It needs an API token on a machine that can run Wrangler, or a CI job, so the files can be written straight to disk.

### What is not live

| Path or Worker | What it is |
| :--- | :--- |
| `live-site/` | A snapshot taken 17 October 2026, since edited by pull requests (15 pages on `main`). Nothing deploys it to the public domain. Merging a change here does not change the website. |
| Root `index.html`, `*.html`, `css/`, `js/`, `worker.js` | An older rebuild. Not serving the domain. |
| Worker `alliance-compliance-shield` | A separate standalone Compliance Shield page with one $395 + GST review and an enquiry form. No online payment. Its hostname is unknown. |
| Worker `alliancegroups-production` | Target of `wrangler.owned-site.jsonc`. Not confirmed to serve anything public. |

## Open decisions for the owner

These block work. Do not guess at them, and do not publish licence claims until the first one is settled.

1. **Licence wording.** Four sources disagree:
   - **The live site** (all 65 pages, checked 27 November) says only "Licensed asbestos removal (WorkSafe QLD licence 2331898)". It never says Class A or Class B, and never mentions QBCC, "Licensed Builder" or 33305677.
   - `live-site/` on `main` (not live) says "Class A & B asbestos licence 2331898", "Licensed Builder" and "Approval Q-DESI-EPSX-33305677", and its footer contains the placeholder text "QBCC TODO: add QBCC licence number".
   - The indexing brief (below) says licence 2331898 is Class B, that Class A (friable) work is subcontracted, and that "Licensed Builder", QBCC and 33305677 must not appear.
   - The `alliance-compliance-shield` Worker says "Fully Licensed Class A & Class B".

   The owner needs to state what the WorkSafe Queensland licence actually covers. Until then, do not add any class wording to the live site, and do not copy the `live-site/` wording across.
2. **Compliance Shield online payment.** The owner expects three tiers with online payment. The live `/compliance-shield/membership/` page shows three levels (Shield Review at $395 + GST, Shield Verify and Shield Annual), but no page on the live site links to a payment processor, and its forms post to `formsubmit.co`, which emails `info@alliancegroups.com.au`. Online payment exists only as unmerged pull request #68 (PayPal, Silver/Gold/Platinum). Whether the owner wants #68's version or the live three levels is unconfirmed.
3. **Cloudflare security settings.** The owner changed two bot and security settings on 7 November on advice that was not supported by evidence. The current settings are deliberately not recorded here, because this repository is public. Read them from the Cloudflare dashboard or the connector when needed, and ask the owner whether to restore the earlier values.

## Pending work: indexing fixes (not deployed)

Reported by a separate chat session, working from a brief dated 11 November 2026. **None of it is in this repository and none of it is live.** This session confirmed only that the deployed Worker contains none of these changes and that `/llms.txt` returns 404.

- Worker: one-hop 301 redirects for about 57 old addresses, `www` straight to the final page, a `Content-Signal` header, a `Link` header pointing at `/llms.txt`, and `noindex` on `/compliance-shield/portal/`.
- KV pages: footer licence line, schema credential, the footer "Member Portal" link changed to point at `/compliance-shield/`, an Ipswich description fix, one line added to `robots.txt`, and a new `/llms.txt`.
- That session tested its patch script only against made-up pages, never the real ones.

To finish it, a session needs all of:
- the patch files from that chat, committed to this repository;
- a Cloudflare API token that can read and write the KV namespace and deploy the Worker, supplied through the session's secure credential form and never pasted into chat;
- the licence decision above;
- a dry run against the real pages, reviewed by the owner, before anything is applied.

First step once a token exists: export the live KV pages and the deployed Worker into this repository, so the real site is finally under version control and has a backup.

## Google tags

Checked 12 and 27 November 2026.

- **Live site, GA4:** Cloudflare's Google Tag Gateway is on for `G-ERL9GEWR1B` (first-party endpoint `/metrics`, option "set up tag" off), read from the zone settings. Only the 404 page has the GA4 loader in its HTML; the other 64 live pages do not. A comment in the live script `/assets/nd/analytics.js` says the gateway injects the loader and that the "second GA4 property" was removed on purpose. Whether the other 64 pages actually report to `G-ERL9GEWR1B` could not be seen from here, because Cloudflare challenges cloud machines. Check it with GA4 Realtime or Tag Assistant.
- **Live site, Google Ads:** the Ads tag `AW-18006768389` is loaded by `/assets/nd/analytics.js`, and only 10 of the 65 pages include that script (nine pages, for example Ipswich and Logan, plus the member portal). The other 55 pages do not include it in their HTML. Whether that is intended is unconfirmed.
- **Live site, other scripts:** 64 pages (all but the member portal) load Ahrefs analytics, and 55 load Cloudflare Web Analytics. No page loads Tag Manager or PostHog, and `G-PNHVYYPM84` is not on the live site.
- **Repository pages (root rebuild, not live):** load `G-PNHVYYPM84` and `AW-18006768389`. Pull request #70 was merged into `main` on 26 November by the owner's account. It added `G-ERL9GEWR1B` and a second `gtag.js` loader to both intake pages (each now loads the Google tag twice) and carried four unrelated commits (homepage and hero changes, Firebase demand relay, Tag Manager on one page). None of it is live, because the deploy workflow cannot run and the live site is served from KV. Adding `G-ERL9GEWR1B` in page code would double up with the Tag Gateway if these files were ever served. Pull request #72 predates that merge and now overlaps it.
- **The `G-PNHVYYPM84` tag fans out.** In a browser test of the repository pages it also sent page views to `G-RLJD9TB11M`, `G-ZPQ7KVKW3W` (two per load), `G-XYD5P3KY9B`, `G-Q0T47Q8SQH` and Merchant Center `MC-B00TT0C6Z2`, including from the intake pages. Those destinations are set in the Google tag's settings, not in code. Which properties are wanted is the owner's call.
- No repository page asks for analytics consent.

## Known traps

- **A 403 from a cloud session proves nothing about Google.** Requests for HTML pages from Claude's cloud machines get Cloudflare's "Just a moment..." challenge, while `.txt` files load. Sending a Googlebot user-agent from such a machine is not a test of Googlebot, which Cloudflare identifies by network address. To find out what Google sees, use Search Console's URL Inspection, "Test live URL".
- **GitHub Actions is locked by a billing issue on the organisation.** Every job since at least 4 November 2026 fails before running a step, with the annotation "The job was not started because your account is locked due to a billing issue." A red check is not a code failure until billing is fixed.
- **`AGENTS.md`, `README.md` and `BOT_SITE_EDITING.md` used to say `live-site/` was the live source.** Sessions that believed it have merged changes there that never reached the public site.

## Log

- 2026-11-07: Pull request #65 (apex canonicals in `live-site/`) opened, then closed on 11 November once it was clear that directory is not deployed.
- 2026-11-07: Pull request #66 merged an "Our Work" section and licence wording into `live-site/`. Not live.
- 2026-11-12: This file created. `AGENTS.md` corrected to match.
- 2026-11-12: Pull request #72 opened as a clean replacement for #70 (second GA4 property on marketing pages only). "Google tags" section added from its browser test.
- 2026-11-26: Pull request #70 merged into `main` by the owner's account, intake pages included.
- 2026-11-27: Read-only pass through the Cloudflare connector: routes, Tag Gateway, and all 65 live pages in KV. Corrected the serving, licence, payment and Google tag sections above. Security settings were read but not recorded, because this repository is public.
