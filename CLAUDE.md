# Alliance Group: single operating file

Read this first. It is the one place that records what is true about the Alliance website and what is still open, so the owner does not have to re-explain it to each new chat or bot. `AGENTS.md` holds the standing rules; this file holds the current state.

**Keep it current.** At the end of any session that changes something, or learns something that contradicts this file, update the relevant section and add a line to the log at the bottom. Record only what you checked yourself, and say how you checked it. If you are repeating something another session reported, say so.

This repository is public. Do not put secrets, tokens, customer details or security settings in this file.

## The one repository

`AllianceGroupAU/alliancegroups-site` is the home for all website and indexing work. Do not start new repositories or keep work in a chat's own files: anything worth keeping is committed here on a branch with a pull request.

## What actually serves alliancegroups.com.au

Checked 11–12 November 2026 by reading the deployed Worker code through the Cloudflare connector and by requesting the public site.

- The Cloudflare Worker `alliance-main-site` (last modified 1 November 2026) serves every public page from a KV namespace bound as `SITE`. The account's only KV namespace is titled `alliance-preview-20261031`.
- **The live pages are not in this repository.** They exist only in that KV namespace. A second session counted about 40 pages there; this session could not list KV keys.
- **The deployed Worker code is not in this repository either.** The root `worker.js` is an older relative of it without the KV page serving.
- `www.alliancegroups.com.au` redirects (301) to `alliancegroups.com.au`. The apex is the canonical host. The live `robots.txt` already points at `https://alliancegroups.com.au/sitemap.xml`.
- The Worker named in `wrangler.live.jsonc` matches, but this session could not view Cloudflare routes, so the route-to-Worker link rests on that file and on the other session's check.

### What is not live

| Path or Worker | What it is |
| :--- | :--- |
| `live-site/` | A snapshot taken 17 October 2026, since edited by pull requests (15 pages on `main`). Nothing deploys it to the public domain. Merging a change here does not change the website. |
| Root `index.html`, `*.html`, `css/`, `js/`, `worker.js` | An older rebuild. Not serving the domain. |
| Worker `alliance-compliance-shield` | A separate standalone Compliance Shield page with one $395 + GST review and an enquiry form. No online payment. Its hostname is unknown. |
| Worker `alliancegroups-production` | Target of `wrangler.owned-site.jsonc`. Not confirmed to serve anything public. |

## Open decisions for the owner

These block work. Do not guess at them, and do not publish licence claims until the first one is settled.

1. **Licence wording.** Three sources disagree:
   - `live-site/` on `main` says "Class A & B asbestos licence 2331898", "Licensed Builder", and "Approval Q-DESI-EPSX-33305677", and its footer contains the placeholder text "QBCC TODO: add QBCC licence number".
   - The indexing brief (below) says licence 2331898 is Class B, that Class A (friable) work is subcontracted, and that "Licensed Builder", QBCC and 33305677 must not appear.
   - The `alliance-compliance-shield` Worker says "Fully Licensed Class A & Class B".

   The owner needs to state what the WorkSafe Queensland licence actually covers. Everything else follows from that.
2. **Compliance Shield online payment.** The owner expects three tiers with online payment. No payment link has been found in anything this session could read. Where payment happens, or whether it has been built at all, is unconfirmed.
3. **Cloudflare security settings.** Bot Fight Mode was turned off and Security Level lowered on 7 November on advice that was not supported by evidence (see "Known traps"). The owner may want the earlier settings back.

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

First step once access exists: export the live KV pages and the deployed Worker into this repository, so the real site is finally under version control and has a backup.

## Known traps

- **A 403 from a cloud session proves nothing about Google.** Requests for HTML pages from Claude's cloud machines get Cloudflare's "Just a moment..." challenge, while `.txt` files load. Sending a Googlebot user-agent from such a machine is not a test of Googlebot, which Cloudflare identifies by network address. To find out what Google sees, use Search Console's URL Inspection, "Test live URL".
- **GitHub Actions is locked by a billing issue on the organisation.** Every job since at least 4 November 2026 fails before running a step, with the annotation "The job was not started because your account is locked due to a billing issue." A red check is not a code failure until billing is fixed.
- **`AGENTS.md`, `README.md` and `BOT_SITE_EDITING.md` used to say `live-site/` was the live source.** Sessions that believed it have merged changes there that never reached the public site.

## Log

- 2026-11-07: Pull request #65 (apex canonicals in `live-site/`) opened, then closed on 11 November once it was clear that directory is not deployed.
- 2026-11-07: Pull request #66 merged an "Our Work" section and licence wording into `live-site/`. Not live.
- 2026-11-12: This file created. `AGENTS.md` corrected to match.
