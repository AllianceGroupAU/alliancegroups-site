# Asbestos website conversion benchmark | 15 October 2026

## Verified competitor observations
- **Asbestology** (https://www.asbestology.com.au/): user-supplied current page text. Clear premium asbestos positioning; prominent contact/quote form; real projects, test/inspection/removal and carpentry service detail; 305 reviews claimed on supplied page and published $390 + GST on-site consultation fee. Treat these as **their** claims, never Alliance's.
- **Irwin Asbestos / Irwin Services** (https://www.irwinasbestos.com.au/ and https://irwinservices.com.au/): strongly targeted asbestos-removal Brisbane headline, friable and non-friable categories, direct pricing/assessment request, testimonials, licence and insurance details.
- **Zero Asbestos** (https://zeroasbestos.com.au/): Class A, make-safe, NATA testing, contaminated soil and industry-specific service pathways.
- **Total Services Group** (https://totalasbestos.com.au/): service categories, measured process, project examples, FAQs and substantiated compliance credentials. Predominantly SA, benchmark for page design rather than Brisbane ranking.

## Alliance-specific differentiation
Asbestos first, but not asbestos only: a property owner or manager can use one contractor for asbestos control/removal and subsequent building repair or reinstatement. Keep claims limited to the actual licence, service capability, available resources and written scope. Never invent review counts, awards, team sizes, response times, prices or completed project totals.

## Implemented in branch
1. Asbestos-first homepage title, hero and social metadata.
2. Four-field asbestos quote enquiry placed visibly in hero, using existing form-handler and `/api/intake`, rather than a new untested email channel.
3. Material/service shortcut cards and plain-language Queensland FAQ.
4. Removed fictional Compliance Shield dashboard volume counts.
5. Kept existing general property intake form and mobile call/CTA.
6. Updated integration smoke assertions.

## Release BLOCKERS: MUST VERIFY BEFORE PUBLISHING
- Live https://alliancegroups.com.au/ differs substantially from this GitHub `index.html`. Identify actual ChatGPT-built live Cloudflare origin, script/assets and release source; do **not** overwrite production with this repo.
- Confirm active Cloudflare routes and Worker bindings, database or durable lead capture, email notification integration to la.asbestos@gmail.com **and an actual owner-received non-production test**. A 202 response does not by itself prove an inbox delivery.
- Confirm exact Queensland asbestos licence numbers and licenced-entity name before publishing numbers or badges; Class A licence permits applicable non-friable work as well.
- Check every photo is genuinely Alliance's and approved for public use; do not imply a stock or illustrative image is project proof.
- Run `npm test`, Cloudflare build, links/forms/mobile/a11y tests on preview; visually check CSS at 375, 768 and 1440 widths; obtain Cloudflare deployment/rollback snapshot.
- Review whether pricing is authorised for public use. No invented price was added; current FAQ explains cost factors.
- PR merge does **not** automatically mean live Cloudflare deploy.

## Metrics to monitor after verified release
Quote form submits, 200/success vs 202/captured-without-email vs network errors, email notifications actually received, tracked tap-to-call, asbestos-page → quote conversion rate, mobile abandonment, and verified leads (not test records).
