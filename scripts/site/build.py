#!/usr/bin/env python3
"""Build the Alliance Group public site into live-site/.

Pages are plain HTML. This script holds the shared layout (head, header,
footer, forms, structured data) so every page stays consistent. Edit the
content modules (pages_*.py), then run:  python3 scripts/site/build.py
Only the Python standard library is needed.
"""
from __future__ import annotations
import html
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
OUT = ROOT / "live-site"
sys.path.insert(0, str(HERE))

SITE = "https://www.alliancegroups.com.au"
PHONE = "0403 126 276"
TEL = "0403126276"
PHONE_INTL = "+61403126276"
EMAIL = "info@alliancegroups.com.au"
REVIEW_URL = "https://g.page/r/CThhguWLkpdYEBM/review"
API = "https://us-central1-alliance-hub-5ed2c.cloudfunctions.net/submitLead"
GA_ID = "G-PNHVYYPM84"
SORO = "https://app.trysoro.com/api/embed/b5fd38b4-b7bf-4377-9428-2014ee8a8f7e"
UPDATED = "2026-10-29"
UPDATED_TEXT = "29 October 2026"
VERSION = "20261029b"
OG_IMAGE = "/assets/img/og-alliance.jpg"

IMAGES = json.loads((HERE / "images.json").read_text())

esc = html.escape

ICON_PHONE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>'
ICON_TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="#13241f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>'
ICON_ALERT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l9 16H3z"/><path d="M12 10v4"/><path d="M12 17h.01"/></svg>'

# Navigation exactly as the approved design: same labels, same order.
NAV = [
    ("/emergency-response/", "Emergency"),
    ("/roofing/", "Roofing"),
    ("/asbestos-hazmat/", "Asbestos & Hazmat"),
    ("/mould-remediation/", "Mould & Remediation"),
    ("/compliance-shield/", "Compliance Shield™"),
    ("/about/", "About"),
]
MOBILE_NAV = NAV

BUSINESS_ID = SITE + "/#business"
AREAS_SCHEMA = [
    {"@type": "City", "name": "Brisbane"},
    {"@type": "AdministrativeArea", "name": "City of Moreton Bay"},
    {"@type": "City", "name": "Ipswich"},
    {"@type": "City", "name": "Logan"},
    {"@type": "AdministrativeArea", "name": "Redland City"},
    {"@type": "AdministrativeArea", "name": "South East Queensland"},
]


# ---------------------------------------------------------------- images
def pic(name: str, alt: str, sizes: str = "100vw", cls: str = "", eager: bool = False, style: str = "") -> str:
    meta = IMAGES[name]
    variants = meta["variants"]
    avif = ", ".join(f"/assets/img/{name}-{v['w']}.avif {v['w']}w" for v in variants)
    webp = ", ".join(f"/assets/img/{name}-{v['w']}.webp {v['w']}w" for v in variants)
    fallback = next((v for v in variants if v["w"] >= 1200), variants[-1])
    attrs = [f'src="/assets/img/{name}-{fallback["w"]}.webp"', f'width="{meta["w"]}"', f'height="{meta["h"]}"', f'alt="{esc(alt)}"', 'decoding="async"']
    attrs.append('fetchpriority="high"' if eager else 'loading="lazy"')
    if cls:
        attrs.append(f'class="{cls}"')
    if style:
        attrs.append(f'style="{style}"')
    return (f'<picture><source type="image/avif" srcset="{avif}" sizes="{sizes}">'
            f'<source type="image/webp" srcset="{webp}" sizes="{sizes}"><img {" ".join(attrs)}></picture>')


def preload(name: str, sizes: str = "100vw") -> str:
    variants = IMAGES[name]["variants"]
    avif = ", ".join(f"/assets/img/{name}-{v['w']}.avif {v['w']}w" for v in variants)
    return f'<link rel="preload" as="image" type="image/avif" imagesrcset="{avif}" imagesizes="{sizes}" fetchpriority="high">'


# ---------------------------------------------------------------- pieces
def header() -> str:
    nav = "".join(f'<a href="{h}">{esc(t)}</a>' for h, t in NAV)
    mnav = "".join(f'<a href="{h}">{esc(t)}</a>' for h, t in MOBILE_NAV)
    return f'''<a class="skip" href="#main">Skip to content</a>
<header class="hdr">
<div class="strip"><div class="wrap mono"><span><i></i>Class A &amp; B asbestos removal · Emergency response</span><span class="r">Brisbane &amp; South East Queensland · <a href="tel:{TEL}">{PHONE}</a></span></div></div>
<div class="bar"><div class="wrap">
<a class="brand" href="/" aria-label="Alliance Group home"><img class="logo" src="/assets/img/logo-copper.png" width="461" height="437" alt="Alliance Group — Structure. Safety. Standards."></a>
<nav class="main" aria-label="Main navigation">{nav}</nav>
<details class="mnav"><summary>Menu</summary><nav aria-label="Mobile navigation">{mnav}<a href="#quote">Get a quote</a></nav></details>
<div class="acts"><a class="btn ghost" href="#quote">Get a quote</a><a class="btn" href="tel:{TEL}">{ICON_PHONE}{PHONE}</a></div>
<a class="mcall" href="tel:{TEL}" aria-label="Call Alliance Group on {PHONE}">{ICON_PHONE}</a>
</div></div>
</header>'''


def footer() -> str:
    return f'''<footer><div class="wrap">
<div class="foot">
<div><img class="logo" src="/assets/img/logo-ink.png" width="461" height="437" alt="Alliance Group" loading="lazy"><p>Asbestos, hazardous-material, roofing and remediation services across Brisbane and South East Queensland.</p></div>
<div><div class="mono">Services</div><a href="/emergency-response/">Emergency response</a><a href="/roofing/">Roofing</a><a href="/asbestos-hazmat/">Asbestos &amp; hazmat</a><a href="/mould-remediation/">Mould &amp; remediation</a><a href="/property-managers/">Property managers &amp; strata</a></div>
<div><div class="mono">Company</div><a href="/about/">About Alliance</a><a href="/compliance-shield/">Compliance Shield™</a><a href="/#check">Asbestos check</a><a href="/service-areas/">Areas we cover</a><a href="/guides/">Guides</a><a href="/contact/">Contact</a></div>
<div><div class="mono">Contact</div><a href="tel:{TEL}">{PHONE}</a><a href="mailto:{EMAIL}">{EMAIL}</a><a href="{REVIEW_URL}" rel="noopener" target="_blank">Leave us a Google review ↗</a></div>
</div>
<div class="legal mono"><span>© 2026 Alliance Group · Structure. Safety. Standards.</span><span><a href="/privacy/">Privacy &amp; your enquiry</a> · <a href="/contact/">Contact</a></span></div>
</div></footer>
<div class="mbar"><a class="btn" href="tel:{TEL}">Call {PHONE}</a><a class="btn ghost" href="#quote">Get a quote</a></div>'''


SERVICES_PICK = [
    ("Asbestos & Hazmat", "Asbestos &amp; Hazmat"),
    ("Building & Remediation", "Building &amp; Remediation"),
    ("Roofing & Make-Safe", "Roofing &amp; Make-Safe"),
    ("Property Managers & Strata", "Property Managers &amp; Strata"),
    ("Compliance Shield overview", "Compliance Shield overview"),
]


def quick_form(preselect: str = "", title: str = "Request a site response") -> str:
    picks = []
    for i, (value, label) in enumerate(SERVICES_PICK):
        checked = " checked" if value == preselect else ""
        required = " required" if i == 0 else ""
        picks.append(f'<label class="pick"><input type="radio" name="service" value="{esc(value)}"{required}{checked}><span>{label}</span></label>')
    # Matches the approved design: five picks, four fields, one button.
    # Photos are added after sending, by email with the enquiry reference, or on the full intake page.
    return f'''<form class="form enquiry-form" id="quick-quote" data-form-type="quick" action="{API}" method="post">
<div class="form-body">
<h3>{esc(title)}</h3>
<p class="note">Takes under a minute. Photos can be added after you send.</p>
<div class="trap" aria-hidden="true"><label>Leave this field empty<input type="text" name="_hp" tabindex="-1" autocomplete="off"></label></div>
<fieldset><legend class="step-l mono"><span>1</span> <span>What needs attention?</span></legend>
<div class="picks odd">{"".join(picks)}</div></fieldset>
<fieldset><legend class="step-l mono"><span>2</span> <span>Where and who</span></legend>
<div class="fields">
<label for="qq-name">Name *<input id="qq-name" name="name" required minlength="2" maxlength="120" autocomplete="name" placeholder="Your name"></label>
<label for="qq-phone">Phone *<input id="qq-phone" type="tel" name="phone" required minlength="7" maxlength="20" autocomplete="tel" inputmode="tel" placeholder="Best contact number"></label>
<label class="full" for="qq-suburb">Suburb or address<input id="qq-suburb" name="suburb" maxlength="150" autocomplete="address-level2" placeholder="e.g. Chermside"></label>
<label class="full" for="qq-message">What is happening? *<input id="qq-message" name="message" required minlength="5" maxlength="1500" placeholder="e.g. Cracked fibro wall in the bathroom"></label>
</div>
</fieldset>
<button class="btn" type="submit">Send my request</button>
<small>Prefer to talk? <a href="tel:{TEL}">Call {PHONE}</a>. For immediate danger, call 000. We use your details only to respond to this enquiry.</small>
</div>
<div class="form-done" aria-live="polite">
<span class="ok">{ICON_TICK}</span>
<h3 data-done-title>Request received.</h3>
<p>We will call you on the number you gave to work out the next step. If it is urgent, call {PHONE} now.</p>
<p>Got photos? Email them with your reference and we will add them to the job.</p>
<div class="actions"><a class="btn email-enquiry" href="mailto:{EMAIL}">Email your photos</a><button class="btn ghost ink" type="button" data-again>Back to the form</button></div>
</div>
<p class="form-status" role="status" aria-live="polite" tabindex="-1" hidden></p>
<div class="form-error-help" hidden><p>Call <a href="tel:{TEL}">{PHONE}</a> or <a class="email-enquiry" href="mailto:{EMAIL}">email your enquiry</a>. Your entered details stay on this page.</p></div>
</form>'''


def quote_section(preselect: str = "", label: str = "Next step", heading: str = "Have a property issue that needs sorting?",
                  lede: str = "Send us the address, photos and a short description of the problem. We will work out the practical next step.") -> str:
    return f'''<section class="next" id="quote" aria-labelledby="quote-h"><div class="wrap">
<div>
<div class="mono label">{label}</div>
<h2 id="quote-h">{heading}</h2>
<p class="lede">{lede}</p>
<div class="actions"><a class="btn" href="tel:{TEL}">Call {PHONE}</a><a class="btn ghost" href="/intake/">Add photos &amp; full details →</a></div>
<div class="contact-lines">
<a href="tel:{TEL}"><span class="mono">Phone</span><b>{PHONE}</b></a>
<a href="mailto:{EMAIL}"><span class="mono">Email</span><b class="em">{EMAIL}</b></a>
<a href="/service-areas/"><span class="mono">Service area</span><b>Brisbane &amp; South East Queensland</b></a>
</div>
</div>
{quick_form(preselect)}
</div></section>'''


def faq_section(items, label="Questions", heading="Clear answers before you book.", sub=None, anchor="faq") -> str:
    sub = sub or f'Still unsure? <a href="tel:{TEL}">Call {PHONE}</a>.'
    qs = []
    for i, (q, a) in enumerate(items):
        open_attr = ' open' if i == 0 else ''
        qs.append(f'<details class="q"{open_attr}><summary>{esc(q)} <i aria-hidden="true">+</i></summary><div class="a">{a}</div></details>')
    return f'''<section class="faq" id="{anchor}" aria-labelledby="{anchor}-h"><div class="wrap">
<div><div class="mono label">{label}</div><h2 id="{anchor}-h">{heading}</h2><p class="sub">{sub}</p></div>
<div>{"".join(qs)}</div>
</div></section>'''


def faq_schema(items):
    import re
    def plain(s):
        return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", s)).strip()
    return {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": html.unescape(plain(a))}} for q, a in items]}


def crumbs(items) -> str:
    lis = []
    for i, (href, text) in enumerate(items):
        if i == len(items) - 1:
            lis.append(f'<li aria-current="page">{esc(text)}</li>')
        else:
            lis.append(f'<li><a href="{href}">{esc(text)}</a></li>')
    return f'<nav aria-label="Breadcrumb"><ol class="crumbs mono">{"".join(lis)}</ol></nav>'


def crumbs_schema(items):
    return {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": text, "item": SITE + href} for i, (href, text) in enumerate(items)]}


def page_hero(image, alt, crumb_items, kicker, h1, lede, actions=None, trust=None, plain=False) -> str:
    actions = actions if actions is not None else f'<a class="btn" href="#quote">Get a quote</a><a class="btn ghost" href="tel:{TEL}">Call {PHONE}</a>'
    trust_html = ""
    if trust:
        trust_html = '<ul class="trust">' + "".join(f"<li>{t}</li>" for t in trust) + "</ul>"
    img = pic(image, alt, eager=True) if image and not plain else ""
    cls = "phero plain" if plain else "phero"
    return f'''<div class="{cls}">
{img}
<div class="wrap hero-copy">
{crumbs(crumb_items)}
<div class="kicker">{kicker}</div>
<h1>{h1}</h1>
<p class="lede">{lede}</p>
<div class="actions">{actions}</div>
{trust_html}
</div>
</div>'''


def band(heading, sub_btn_text="Get a quote", href="#quote") -> str:
    return f'''<section class="band"><div class="wrap"><h2>{heading}</h2><div class="actions"><a class="btn" href="tel:{TEL}">Call {PHONE}</a><a class="btn ghost" href="{href}">{sub_btn_text}</a></div></div></section>'''


def link_cards(cards, cls="cards") -> str:
    out = []
    for c in cards:
        out.append(f'<a class="lcard" href="{c["href"]}"><span class="mono">{c.get("tag", "")}</span><h3>{c["title"]}</h3><p>{c["text"]}</p><span class="more">{c.get("more", "Read more")} →</span></a>')
    return f'<div class="{cls}">{"".join(out)}</div>'


def era_check(heading_label="Asbestos check", anchor="check") -> str:
    return f'''<section class="check" id="{anchor}" aria-labelledby="{anchor}-h"><div class="wrap">
<div class="head"><div><div class="mono label">{heading_label}</div><h2 id="{anchor}-h">Built before 1990? <span>Read this first.</span></h2></div><p>Queensland guidance is simple: if a home was built before 1990, it is likely to contain some asbestos. Check before anyone drills, cuts or sands.</p></div>
<div class="check-grid">
<div class="card" data-era-check>
<h3>When was the property built?</h3>
<p class="q">Tap one to see what it means before work starts.</p>
<div class="eras" role="group" aria-label="When the property was built">
<button class="era" type="button" data-era="pre" aria-pressed="false">Before 1990</button>
<button class="era" type="button" data-era="mid" aria-pressed="false">1990 – 2003</button>
<button class="era" type="button" data-era="post" aria-pressed="false">After 2003</button>
</div>
<div class="result" aria-live="polite">
<p class="hint">Pick a year range above. Not sure? Treat it as older and get it checked.</p>
<div class="era-res" data-era-result="pre"><b>Before 1990: likely to contain asbestos</b><p>If a home was built before 1990, it is likely to contain some asbestos materials. Leave suspect material alone until it has been checked, and plan any renovation around it.</p><a class="btn" href="#quote">Book an asbestos check</a></div>
<div class="era-res" data-era-result="mid"><b>1990 – 2003: less likely, still possible</b><p>Asbestos was banned in building products in 1990, but some homes built in the 1990s and early 2000s still used asbestos products until the total ban in 2003. Check before you renovate.</p><a class="btn" href="#quote">Ask us to check it</a></div>
<div class="era-res" data-era-result="post"><b>After 2003: unlikely in the original build</b><p>The total ban came into effect in 2003. Older sections, extensions or reused materials can still contain asbestos, so check anything that pre-dates the build.</p><a class="btn ghost" href="#quote">Not sure? Ask us</a></div>
</div>
<span class="src mono">Source: <a href="https://www.qbcc.qld.gov.au/dz/node/1266" rel="noopener">Queensland Government asbestos guidance</a></span>
</div>
<figure class="map">
<svg viewBox="0 0 640 420" role="img" aria-labelledby="{anchor}-svg-t"><title id="{anchor}-svg-t">Diagram of a house showing eight common places asbestos is found</title>
<g fill="none" stroke="#e9e3d6" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">
<path d="M20 380H620" stroke-opacity=".5"/><path d="M22 300l36-24 36 24v80H22z"/><path d="M40 380v-48h34v48"/><path d="M120 182h370v198H120z"/><path d="M98 184L295 66l197 118"/><path d="M132 176L295 78l163 98" stroke-opacity=".45"/><path d="M170 150l-14 9M205 129l-14 9M240 108l-14 9M275 87l-14 9M315 87l14 9M350 108l14 9M385 129l14 9M420 150l14 9" stroke-opacity=".6"/><path d="M96 186h400v8H96z" stroke-opacity=".8"/><path d="M120 194h-22M490 194h22" stroke-opacity=".6"/><path d="M175 194v186M230 194v186M285 194v186" stroke-opacity=".35"/><path d="M330 194v186" stroke-dasharray="6 6" stroke-opacity=".6"/><path d="M150 278h28v40h-28z"/><path d="M156 288h16M156 298h16" stroke-opacity=".6"/><path d="M200 230h60v50h-60z" stroke-opacity=".7"/><path d="M230 230v50M200 255h60" stroke-opacity=".5"/><path d="M360 246h96v40h-96z"/><path d="M384 246v40M408 246v40M432 246v40M360 266h96" stroke-opacity=".5"/><path d="M370 300h58v20h-58z" stroke-opacity=".7"/><path d="M332 368h156" stroke-width="5" stroke-opacity=".6"/><path d="M512 300h108M512 340h108" stroke-opacity=".7"/><path d="M520 292v88M548 292v88M576 292v88M604 292v88" stroke-opacity=".7"/>
</g>
<g font-family="Inter, Arial, sans-serif" font-size="14" font-weight="700" text-anchor="middle">
<circle cx="295" cy="112" r="14" fill="#ed713c"/><text x="295" y="117" fill="#13241f">1</text>
<circle cx="104" cy="214" r="14" fill="#ed713c"/><text x="104" y="219" fill="#13241f">2</text>
<circle cx="258" cy="216" r="14" fill="#ed713c"/><text x="258" y="221" fill="#13241f">3</text>
<circle cx="164" cy="298" r="14" fill="#ed713c"/><text x="164" y="303" fill="#13241f">4</text>
<circle cx="408" cy="232" r="14" fill="#ed713c"/><text x="408" y="237" fill="#13241f">5</text>
<circle cx="410" cy="352" r="14" fill="#ed713c"/><text x="410" y="357" fill="#13241f">6</text>
<circle cx="566" cy="320" r="14" fill="#ed713c"/><text x="566" y="325" fill="#13241f">7</text>
<circle cx="58" cy="344" r="14" fill="#ed713c"/><text x="58" y="349" fill="#13241f">8</text>
</g>
</svg>
<ol class="spots">
<li><b>1</b>Roof sheeting &amp; gutters</li><li><b>2</b>Eaves &amp; soffit sheeting</li><li><b>3</b>Wall &amp; ceiling sheets (fibro)</li><li><b>4</b>Meter &amp; fuse boxes</li><li><b>5</b>Wet-area splashbacks</li><li><b>6</b>Vinyl flooring &amp; underlay</li><li><b>7</b>Fences</li><li><b>8</b>Sheds &amp; outbuildings</li>
</ol>
</figure>
</div>
</div></section>'''


# ---------------------------------------------------------------- schema
def business_schema():
    return {
        "@type": "HomeAndConstructionBusiness",
        "@id": BUSINESS_ID,
        "name": "Alliance Group",
        "alternateName": "Alliance Building & Hazmat Group",
        "slogan": "Structure. Safety. Standards.",
        "description": "Licensed Class A and Class B asbestos removal, hazardous-material work, emergency make-safe, roofing, mould remediation and repair across Brisbane and South East Queensland.",
        "url": SITE + "/",
        "telephone": PHONE_INTL,
        "email": EMAIL,
        "logo": SITE + "/assets/img/logo-copper.png",
        "image": SITE + OG_IMAGE,
        "address": {"@type": "PostalAddress", "addressRegion": "QLD", "addressCountry": "AU"},
        "areaServed": AREAS_SCHEMA,
        "knowsAbout": ["Asbestos removal", "Friable asbestos removal", "Non-friable asbestos removal", "Hazardous materials", "Emergency make-safe", "Storm damage repairs", "Roof repairs", "Mould remediation", "Water damage repairs", "Building reinstatement"],
        "hasOfferCatalog": {"@type": "OfferCatalog", "name": "Alliance Group services", "itemListElement": [
            {"@type": "Offer", "itemOffered": {"@type": "Service", "name": n, "url": SITE + u}} for n, u in [
                ("Asbestos removal", "/asbestos-hazmat/"), ("Emergency make-safe and storm damage", "/emergency-response/"),
                ("Roof repairs and asbestos roof replacement", "/roofing/"), ("Mould remediation and water damage repairs", "/mould-remediation/"),
                ("Compliance Shield site compliance records", "/compliance-shield/")]]},
    }


def website_schema():
    return {"@type": "WebSite", "@id": SITE + "/#website", "url": SITE + "/", "name": "Alliance Group", "inLanguage": "en-AU", "publisher": {"@id": BUSINESS_ID}}


def service_schema(name, service_type, path, description):
    return {"@type": "Service", "@id": SITE + path + "#service", "name": name, "serviceType": service_type, "description": description,
            "provider": {"@id": BUSINESS_ID}, "areaServed": AREAS_SCHEMA, "url": SITE + path}


def article_schema(path, headline, description, image):
    meta = IMAGES[image]
    return {"@type": "Article", "@id": SITE + path + "#article", "headline": headline, "description": description,
            "image": SITE + f"/assets/img/{image}-{meta['variants'][-1]['w']}.webp", "datePublished": UPDATED, "dateModified": UPDATED,
            "author": {"@id": BUSINESS_ID}, "publisher": {"@id": BUSINESS_ID}, "mainEntityOfPage": SITE + path, "inLanguage": "en-AU"}


# ---------------------------------------------------------------- page
def render(page: dict) -> str:
    path = page["path"]
    url = SITE + path
    title = page["title"]
    desc = page["description"]
    graph = [business_schema(), website_schema(), {
        "@type": "WebPage", "@id": url + "#webpage", "url": url, "name": title, "description": desc,
        "isPartOf": {"@id": SITE + "/#website"}, "about": {"@id": BUSINESS_ID}, "inLanguage": "en-AU", "dateModified": UPDATED}]
    if page.get("crumbs"):
        graph.append(crumbs_schema(page["crumbs"]))
        graph[2]["breadcrumb"] = {"@id": url + "#breadcrumb"}
        graph[-1]["@id"] = url + "#breadcrumb"
    if page.get("faq"):
        f = faq_schema(page["faq"])
        f["@id"] = url + "#faq"
        graph.append(f)
    graph.extend(page.get("schema", []))
    ld = json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    robots = page.get("robots", "index,follow,max-image-preview:large,max-snippet:-1")
    pre = preload(page["preload"]) if page.get("preload") else ""
    og_image = page.get("og_image", OG_IMAGE)
    extra_head = page.get("head", "")
    canonical = f'<link rel="canonical" href="{url}">' if page.get("canonical", True) else ""
    return f'''<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<meta name="robots" content="{robots}">
{canonical}
<meta name="theme-color" content="#0e231d">
<meta property="og:type" content="{page.get("og_type", "website")}">
<meta property="og:locale" content="en_AU">
<meta property="og:site_name" content="Alliance Group">
<meta property="og:title" content="{esc(page.get("og_title", title))}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}{og_image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Alliance Group — asbestos removal and building response, Brisbane">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" href="/assets/img/icon-192.png" sizes="192x192">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/bigshoulders-900.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>
{pre}
<link rel="stylesheet" href="/assets/al.css?v={VERSION}">
<script>document.documentElement.classList.add('js')</script>
<script type="application/ld+json">{ld}</script>
<script defer src="/assets/analytics.js?v={VERSION}"></script>
<script async src="https://www.googletagmanager.com/gtag/js?id={GA_ID}"></script>
<script defer src="/assets/site.js?v={VERSION}"></script>
{extra_head}
</head>
<body>
{header()}
<main id="main">
{page["body"]}
</main>
{footer()}
</body>
</html>
'''


def main():
    import pages_core, pages_areas, pages_guides
    pages = pages_core.PAGES + pages_areas.PAGES + pages_guides.PAGES
    seen = set()
    for page in pages:
        assert page["path"] not in seen, page["path"]
        seen.add(page["path"])
        if page["path"].endswith("/"):
            target = OUT / page["path"].lstrip("/") / "index.html"
        else:
            target = OUT / page["path"].lstrip("/")
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(render(page), encoding="utf-8")
    # sitemap
    urls = [p for p in pages if p.get("sitemap", True) and "noindex" not in p.get("robots", "")]
    body = "\n".join(f"<url><loc>{SITE}{p['path']}</loc><lastmod>{UPDATED}</lastmod></url>" for p in urls)
    (OUT / "sitemap.xml").write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{body}\n</urlset>\n', encoding="utf-8")
    print(f"built {len(pages)} pages, {len(urls)} in sitemap")


if __name__ == "__main__":
    main()
