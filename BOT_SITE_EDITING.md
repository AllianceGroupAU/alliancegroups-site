# Alliance live website: owned source and bot editing

**Goal:** stop using the ChatGPT site editor as the only way to update Alliance. The `live-site/` directory contains an export of the actual published public website, including nine routes, CSS, JavaScript and original media. It is separate from the older GitHub site rebuild at the repository root.

## For JARVIS and other coding bots

- **Edit `live-site/`** when changing the ChatGPT-built Alliance website. Start at `live-site/index.html`, `live-site/assets/site.css`, and `live-site/assets/site.js`.
- Preserve `/intake/`, original Alliance media, `tel:0403126276`, canonical routes, SEO and the existing Google Firebase `submitLead` and signed file upload workflow. Do not invent licences, testimonials, project records or leads.
- Submit changes via branch + pull request to GitHub. Use CI to verify pages and assets. Do not claim the live site changed after a PR merge.
- For every marketing request, review conversion, accessibility, mobile, metadata, image loading, fast enquiries and privacy.
- All outbound client messages stay **draft-only** until owner approval.
- Do not submit fabricated website leads to production as a smoke test.

## Where did the source come from?

`scripts/capture-live-site.py` fetches the **public-facing** production site, nine pages and referenced `/assets/` files. The `capture-live-site.yml` workflow runs once on this migration branch and commits the snapshot under `live-site/`. The script never accesses private ChatGPT data, changes Cloudflare DNS, or sends customer messages.

**Do not re-run the capture after bots start editing this directory**, unless you explicitly want to replace those edits with a fresh public-site snapshot.

## Deployment ownership

Currently, ChatGPT's published site and GitHub's codebase are separate. A GitHub merge cannot publish through ChatGPT Sites. The public domain must first be deliberately attached to a GitHub/Cloudflare deployment with a working preview, validated intake, DNS backup and rollback. Cloudflare previously returned **100117** when attaching an existing custom domain because externally managed DNS records were present.

Before a production cutover:

1. Check who currently owns apex and `www` routing in Cloudflare, and export existing DNS records.
2. Use Cloudflare credentials with only the necessary site/deploy permissions. Never commit tokens or keys.
3. Preview the `live-site/` directory on Cloudflare. Confirm homepage, all routes, logo, photos, links and response headers.
4. Confirm the Firebase `submitLead` endpoint and signed attachments work with **consented** end-to-end delivery verification to the working inbox. A HTTP 200 or unit-test success alone is insufficient.
5. Switch routing carefully and confirm the public site serves the expected build; retain the prior deployment for rollback.
6. Only then enable a controlled GitHub Action to deploy `live-site/` on merged PRs. Avoid automatic deploys until the cutover is proven.

Tracked cutover blocker: https://github.com/AllianceGroupAU/alliancegroups-site/issues/49

## One command to check source

```bash
python3 scripts/check-owned-site.py
```

This source is now a standard GitHub editing workflow, not tied to ChatGPT Work credits. Hosting and GitHub Actions usage may still be subject to the providers' plans.