# Alliance Group website: operating instructions for coding bots

## Source of truth
- `live-site/` is a **Git-owned export of the actually published ChatGPT-built website** (captured 17 October 2026). This is the directory to edit when the owner requests changes to the current live website.
- The older root-level `index.html`, `css/`, `js/`, `intake/`, and `worker.js` belong to a separate rebuild that is NOT currently serving `alliancegroups.com.au`. Do not assume a root-level change alters the public website.
- Never re-capture `live-site/` over bot edits without explicit instruction and backup.

## Product and content requirements
- Brisbane / South East Queensland licensed asbestos and building response. Use actual Alliance photographs and original brand, not fabricated projects or stock/AI images unless explicitly approved.
- Telephone `0403 126 276` throughout. Treat `info@alliancegroups.com.au` as unverified for delivery until routing is tested; `la.asbestos@gmail.com` is the known fallback.
- Preserve the existing Firebase `submitLead` endpoint, signed attachment API, consent controls, call buttons, site access and property details. Do not claim email delivery without mailbox confirmation.
- Do not create fake leads, reviews, statistics, licences, staff, or urgent promises. QLD licensing and WHSQ claims require verification.
- Outbound client emails or SMS are **draft-only**; owner sends them after approval.

## Development workflow
1. Create a branch from main and modify `live-site/` only (plus checks/docs as necessary).
2. Run `python3 scripts/check-owned-site.py` and `node --check live-site/assets/site.js`. Check all nine public routes and local media.
3. Open a PR with screenshots and concise changed-file and rollback notes where available.
4. Do NOT claim the public site was updated by a merged PR. Cloudflare domain ownership/routing cutover remains tracked in issue #49. Confirm public deployment fingerprint and test real enquiry delivery before live claims.
5. No Cloudflare DNS deletion, Google Workspace payment, bank access, or paid services without explicit authorisation.

## Release
Before enabling any automatic production action, ensure a reproducible Cloudflare deployment is attached to the actual hostname, a rollback version is identified, and end-to-end intake works. Avoid accidental deployment of the unrelated root rebuild.
