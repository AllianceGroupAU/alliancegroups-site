"""Core pages: home, services, company, forms."""
from build import (PHONE, TEL, EMAIL, REVIEW_URL, SORO, ICON_PHONE, ICON_TICK, ICON_ALERT, API, UPDATED_TEXT,
                   pic, quote_section, faq_section, era_check, page_hero, band, link_cards, service_schema, esc)

TICK = f'<span class="tick">{ICON_TICK}</span>'

AREA_CARDS = [
    {"href": "/service-areas/", "tag": "Brisbane", "title": "Brisbane", "text": "North, south, east and west Brisbane — homes, rentals, strata and commercial sites.", "more": "Brisbane suburbs"},
    {"href": "/asbestos-removal-moreton-bay/", "tag": "North", "title": "Moreton Bay", "text": "Strathpine, North Lakes, Redcliffe, Caboolture and the surrounding suburbs.", "more": "Moreton Bay"},
    {"href": "/asbestos-removal-ipswich/", "tag": "West", "title": "Ipswich", "text": "Ipswich Central, Goodna, Springfield, Redbank Plains and older western suburbs.", "more": "Ipswich"},
    {"href": "/asbestos-removal-logan/", "tag": "South", "title": "Logan", "text": "Springwood, Browns Plains, Beenleigh, Shailer Park and the Logan corridor.", "more": "Logan"},
]

GUIDE_CARDS = [
    {"href": "/guides/does-my-house-have-asbestos/", "tag": "Guide", "title": "Does my house have asbestos?", "text": "Build year, the eight places to look and what to do before anyone drills.", "more": "Read the guide"},
    {"href": "/guides/asbestos-removal-rules-queensland/", "tag": "Guide", "title": "Queensland removal rules", "text": "The 10 m² rule, Class A and Class B licences, and when you need a licensed removalist.", "more": "Read the guide"},
    {"href": "/guides/asbestos-after-storm-or-flood/", "tag": "Guide", "title": "Asbestos after a storm", "text": "What to do when storm, flood or impact damage breaks fibro or roof sheeting.", "more": "Read the guide"},
]

# ------------------------------------------------------------------ home
HOME_FAQ = [
    ("How can I tell if a material contains asbestos?",
     "<p>Appearance or age alone cannot confirm asbestos. Avoid cutting, drilling, sanding or disturbing suspect material. Have a suitable sample assessed through an accredited laboratory if identification is required.</p>"),
    ("Do you handle friable and non-friable asbestos?",
     "<p>Alliance offers Class A asbestos removal capability. The removal method, notifications, access controls and independent clearance requirements depend on the material and site conditions.</p>"),
    ("How much does asbestos removal cost?",
     "<p>Costs depend on the material, quantity, access, containment, disposal, clearance and any reinstatement. We explain whether an inspection is needed and confirm applicable fees before proceeding.</p>"),
    ("Can people stay in the property during removal?",
     "<p>Occupants must stay out of the asbestos removal work area. Whether other areas may remain occupied is determined by the risk assessment and the required separation and safety controls.</p>"),
    ("Will the job include a clearance certificate?",
     "<p>Clearance and handover requirements vary with the work. Where required, an independent competent person or licensed asbestos assessor provides the relevant documentation.</p>"),
    ("Can you complete repairs afterwards?",
     "<p>Yes. Alliance can scope and carry out associated repairs and reinstatement after the required removal and clearance stages, subject to the agreed project scope.</p>"),
]

HOME_BODY = f'''<div class="hero">
{pic("hero-stripout", "Worker in a stripped-back room during remediation works", eager=True)}
<div class="wrap hero-copy">
<div class="kicker">Brisbane · South East Queensland · Licensed asbestos contractor</div>
<h1>Asbestos removal Brisbane.<span>From hazard to finished repair.</span></h1>
<div class="hero-row">
<p>Licensed asbestos removal, site controls and hazardous-material services across Brisbane and South East Queensland — and the repair and reinstatement that follows. One local contractor from assessment to close-out.</p>
<div class="actions"><a class="btn" href="#quote">Get an asbestos quote</a><a class="btn ghost" href="tel:{TEL}">Call {PHONE}</a></div>
</div>
<ul class="trust"><li>A-Class &amp; B-Class asbestos</li><li>Emergency response</li><li>Repair &amp; reinstatement</li></ul>
</div>
</div>

<section class="emg" id="emergency" aria-labelledby="emg-h">
{pic("flooded-home", "Floodwater across the front yard and driveway of a house after heavy rain")}
<div class="wrap"><div class="emg-copy">
<span class="chip">24/7 emergency response</span>
<h2 id="emg-h">Storm, flood, fire <span>or impact damage?</span></h2>
<p class="lede">When a building is damaged, asbestos and other hazardous materials can be disturbed. We make the site safe, control the hazard and carry the property through to repair.</p>
<div class="alert"><span class="icon">{ICON_ALERT}</span><div><b>Suspected asbestos disturbed or damaged?</b><p>Avoid cutting, drilling, sanding or disturbing it further. Call us and we will work out the safe next step with you.</p></div></div>
<div class="actions"><a class="btn" href="tel:{TEL}">Call {PHONE}</a><a class="btn ghost" href="#quote">Send photos of the damage</a></div>
</div></div>
</section>

<section class="intro" id="services" aria-labelledby="svc-h"><div class="wrap">
<div class="intro-head">
<div><div class="mono label">01 — What we do</div><h2 id="svc-h">From site risk <span>to finished repair.</span></h2></div>
<div><p>We handle the work that lands on a property manager’s desk: asbestos concerns, damage, leaks, mould, make-safe work and the repairs needed to get the property back into use.</p><div class="actions"><a class="btn dark" href="#quote">Send the property details</a></div></div>
</div>
<div class="tiles">
<a class="tile" href="/asbestos-hazmat/">{pic("asbestos-suit", "Worker in protective suit beside a sealed work area and bagged asbestos waste", sizes="(max-width: 980px) 100vw, 50vw", style="object-position:50% 30%")}<div class="tile-txt"><span class="num" aria-hidden="true">01</span><h3>Asbestos &amp; Hazmat</h3><ul class="tags"><li>Removal</li><li>Site controls</li><li>Documentation</li></ul><p>Licensed asbestos removal and hazardous-material work for residential, rental, strata and commercial properties. We manage site controls, removal, waste documentation and the handover required to move the property forward.</p><span class="more">View service →</span></div></a>
<a class="tile" href="/mould-remediation/">{pic("drying-fans", "Drying fans running on a stripped floor after water damage", sizes="(max-width: 980px) 100vw, 50vw")}<div class="tile-txt"><span class="num" aria-hidden="true">02</span><h3>Building &amp; Remediation</h3><ul class="tags"><li>Water damage</li><li>Mould</li><li>Building repairs</li></ul><p>Water damage, mould, damaged linings and contaminated building materials. We open the affected area safely, identify what needs attention and complete the building work required afterwards.</p><span class="more">View service →</span></div></a>
<a class="tile" href="/roofing/">{pic("tarp-roof", "Storm-damaged roof covered with a tarpaulin", sizes="(max-width: 980px) 100vw, 50vw")}<div class="tile-txt"><span class="num" aria-hidden="true">03</span><h3>Roofing &amp; Make-Safe</h3><ul class="tags"><li>Leaks</li><li>Storm damage</li><li>Urgent defects</li></ul><p>Roof leaks, storm damage, water ingress and urgent building defects. We make the property safe, control further damage and carry out the repair work.</p><span class="more">View service →</span></div></a>
<a class="tile" href="/property-managers/">{pic("completed-room", "Bedroom returned to use after repair", sizes="(max-width: 980px) 100vw, 50vw")}<div class="tile-txt"><span class="num" aria-hidden="true">04</span><h3>Property Managers &amp; Strata</h3><ul class="tags"><li>Tenant issues</li><li>Suspect material</li><li>Urgent response</li></ul><p>One point of contact when a tenant raises an asbestos concern, a trade uncovers suspect material or a property needs urgent make-safe work. We can manage the issue through removal, clearance coordination, repair and reinstatement.</p><span class="more">View service →</span></div></a>
</div>
<div class="who"><span class="mono">We work for</span><span>Homeowners</span><span>Landlords</span><span>Property managers</span><span>Strata &amp; body corporate</span><span>Commercial &amp; facilities managers</span><span>Insurance builders &amp; loss adjusters</span></div>
</div></section>

<section class="process" aria-labelledby="proc-h"><div class="wrap">
<div class="head"><div><div class="mono label">02 — How we handle the job</div><h2 id="proc-h">From first call <span>to close-out.</span></h2></div><p>Practical site work, clear communication and the records needed to hand the property back.</p></div>
<figure class="ba">{pic("before-after", "Illustration: a mould-damaged corridor beside the same corridor fully repaired")}<span class="tag t1">Before</span><span class="tag t2">After</span><span class="mid" aria-hidden="true"></span><figcaption class="mono"><span>Hazard found → property back in use</span><span>Illustration</span></figcaption></figure>
<ol class="steps">
<li><b aria-hidden="true">01</b><h3>Attend</h3><p>We get the site details, assess what has happened and identify what needs immediate attention.</p></li>
<li><b aria-hidden="true">02</b><h3>Make safe</h3><p>Hazards are controlled, affected areas are isolated where required and further damage is limited.</p></li>
<li><b aria-hidden="true">03</b><h3>Complete the works</h3><p>We carry out the removal, remediation, repair or roofing work required for the job.</p></li>
<li><b aria-hidden="true">04</b><h3>Close out</h3><p>Final records, photos, waste documentation and clearance coordination are completed so the property can move forward.</p></li>
</ol>
</div></section>

<section class="light" id="why" aria-labelledby="why-h"><div class="wrap">
<figure class="fig">{pic("sunset-tape", "Roofline at dusk behind orange safety barrier tape")}<figcaption class="mono"><span>Fig. 1 — Hazard controlled. Property protected.</span><span>Brisbane · SEQ</span></figcaption></figure>
<div class="why">
<figure class="shot">{pic("danger-tape", "Site fenced off with asbestos dust hazard tape, a work vehicle and a skip bin", sizes="(max-width: 980px) 100vw, 40vw")}<figcaption class="plate mono">Alliance project photograph</figcaption></figure>
<div>
<div class="mono label">03 — Why call Alliance</div>
<h2 id="why-h">One contractor from <span>hazard to repair.</span></h2>
<p class="lede">When asbestos, water damage, mould, roofing failure or damaged building materials affect a property, the job often crosses more than one trade. Alliance can manage the hazardous-material work, make-safe, remediation and the repair that follows — so property managers and owners are not left coordinating multiple contractors to get one property back into use.</p>
<div class="points">
<div>{TICK}<div><h3>Clear site records</h3><p>Photos, job notes, waste documentation and relevant completion records are kept with the job.</p></div></div>
<div>{TICK}<div><h3>Practical updates</h3><p>We tell the property manager what has been found, what needs to happen next and what is holding the job up.</p></div></div>
<div>{TICK}<div><h3>Hazard work and repair work</h3><p>The site does not stop at removal. Where repairs or reinstatement are required, we can carry the job through.</p></div></div>
<div>{TICK}<div><h3>Local SEQ response</h3><p>Brisbane and South East Queensland service for rental, strata, residential and commercial properties.</p></div></div>
</div>
</div>
</div>
</div></section>

{era_check("04 — Asbestos check")}

<section class="shield" id="shield" aria-labelledby="shield-h"><div class="wrap shield-grid">
<div>
<div class="mono label">05 — Compliance Shield™</div>
<h2 id="shield-h">She’ll be right <span>is not a system.</span></h2>
<p class="lede">Missing registers, outdated photos and files spread across five inboxes create stress when proof is needed. Compliance Shield builds a cleaner site record — photos, registers, history and contractor controls — so you can see what is current, what is missing and what should be tightened up.</p>
<div class="gaps">
<div><span class="mono">Gap 01</span><b>Photos</b><p>Site photos that are old, missing or do not show the current condition.</p></div>
<div><span class="mono">Gap 02</span><b>Registers</b><p>Registers that no longer match what is actually on site.</p></div>
<div><span class="mono">Gap 03</span><b>Contractor controls</b><p>No clear record of who worked on site and under what controls.</p></div>
</div>
<ol class="path"><li class="on">1. Overview</li><i aria-hidden="true">→</i><li>2. Baseline Compliance Review</li><i aria-hidden="true">→</i><li>3. Ongoing oversight, if needed</li></ol>
<p class="for"><b>Built for</b> churches, childcare, aged care, retirement living, community facilities, property managers and strata.</p>
<div class="actions"><a class="btn" href="#quote">Request the overview</a><a class="btn ghost" href="/compliance-shield/">How Compliance Shield works →</a></div>
</div>
<figure class="bw">{pic("containment", "Work area sealed with plastic sheeting and marked during asbestos works", sizes="(max-width: 980px) 100vw, 40vw")}<figcaption class="plate mono">Alliance project photograph</figcaption></figure>
</div></section>

<section class="gallery" aria-labelledby="gal-h"><div class="wrap">
<div class="head"><div><div class="mono label">06 — Work on real sites</div><h2 id="gal-h">See the job. <span>See it progress.</span></h2></div><p>Site photographs capture the condition found, work-area controls and the repair or reinstatement underway.</p></div>
<div class="gal">
<figure>{pic("damage-opening", "Opened ceiling showing damage requiring assessment", sizes="(max-width: 980px) 100vw, 45vw")}<figcaption><b>01 Site condition</b><span>Assessment before work starts</span></figcaption></figure>
<figure>{pic("site-protection", "Floors and fittings protected before works start", sizes="(max-width: 980px) 100vw, 30vw")}<figcaption><b>02 Controlled work area</b><span>Protection and site controls</span></figcaption></figure>
<figure>{pic("plaster-reinstatement", "New plasterboard during reinstatement", sizes="(max-width: 980px) 100vw, 30vw")}<figcaption><b>03 Repair &amp; reinstatement</b><span>Putting the building back together</span></figcaption></figure>
</div>
</div></section>

{faq_section(HOME_FAQ, "07 — Asbestos services", "Clear answers before you book.", f'Practical advice for homeowners, property managers and strata across Brisbane. Still unsure? <a href="tel:{TEL}">Call {PHONE}</a>.')}

{quote_section("", "08 — Next step")}
'''

HOME = {
    "path": "/",
    "title": "Asbestos Removal Brisbane | Class A & B Licensed | Alliance Group",
    "og_title": "Asbestos removal Brisbane — from hazard to finished repair",
    "description": "Licensed Class A & B asbestos removal in Brisbane and South East Queensland, plus emergency make-safe, roofing, mould and the repair that follows. Call 0403 126 276.",
    "preload": "hero-stripout",
    "faq": HOME_FAQ,
    "schema": [service_schema("Asbestos removal Brisbane", "Asbestos removal", "/", "Licensed Class A and Class B asbestos removal, site controls, waste documentation and reinstatement across Brisbane and South East Queensland.")],
    "body": HOME_BODY,
}


# ------------------------------------------------------------------ helpers for service pages
def gallery_three(items, heading="Work on real sites", sub="Site photographs capture the condition found, work-area controls and the repair or reinstatement underway."):
    figs = "".join(f'<figure>{pic(n, alt, sizes="(max-width: 980px) 100vw, 33vw")}<figcaption><b>{t}</b><span>{s}</span></figcaption></figure>' for n, alt, t, s in items)
    return f'''<section class="gallery" aria-labelledby="gal-h"><div class="wrap">
<div class="head"><div><div class="mono label">Site evidence</div><h2 id="gal-h">{heading}</h2></div><p>{sub}</p></div>
<div class="gal">{figs}</div>
</div></section>'''


def steps(items, cls="steps"):
    lis = "".join(f'<li><b aria-hidden="true">{i + 1:02d}</b><h3>{t}</h3><p>{p}</p></li>' for i, (t, p) in enumerate(items))
    return f'<ol class="{cls}">{lis}</ol>'


def aside_card(title="Need it looked at?", text="Send photos and the address. We will tell you the practical next step.", preselect=""):
    return f'''<div class="card"><h3>{title}</h3><p>{text}</p><a class="btn" href="#quote">Get a quote</a><a class="btn ghost" href="tel:{TEL}">{PHONE}</a></div>'''


def toc(items):
    return '<ul class="toc">' + "".join(f'<li><a href="#{a}">{t}</a></li>' for a, t in items) + "</ul>"


# ------------------------------------------------------------------ asbestos
ASB_FAQ = [
    ("Do I need a licensed removalist to remove asbestos?",
     "<p>In Queensland a licence is not required to remove 10 m² or less of non-friable (bonded) asbestos, but the work must still follow Part 8.7 of the Work Health and Safety Regulation 2011. More than 10 m² of non-friable asbestos needs a Class B (or Class A) licence. Any amount of friable asbestos needs a Class A licence. <a href=\"/guides/asbestos-removal-rules-queensland/\">Read the full rules</a>.</p>"),
    ("What is the difference between friable and non-friable asbestos?",
     "<p>Non-friable (bonded) asbestos is bound into a material such as cement sheeting, so it does not crumble by hand while it is in good condition. Friable asbestos is loose or can be crumbled, pulverised or reduced to powder by hand pressure, so it releases fibres far more easily and needs a Class A licence to remove.</p>"),
    ("Do you test for asbestos?",
     "<p>Appearance alone cannot confirm asbestos. Where identification is needed, a sample is analysed by an accredited laboratory. We will tell you whether testing is worth doing before any removal is quoted.</p>"),
    ("Can you remove an asbestos roof and put a new one on?",
     "<p>Yes. We remove asbestos cement roof sheeting under the required controls and can carry out the replacement roof and associated repairs. See <a href=\"/roofing/\">roofing and asbestos roof replacement</a>.</p>"),
    ("What happens to the asbestos waste?",
     "<p>Asbestos waste is wrapped, labelled and taken to a facility licensed to accept it, and the waste documentation is kept with the job record.</p>"),
    ("Will I get a clearance certificate?",
     "<p>Where the work requires it, an independent competent person or licensed asbestos assessor carries out the clearance inspection and issues the clearance certificate before the area is reoccupied.</p>"),
    ("Can tenants stay in the property?",
     "<p>Occupants must stay out of the asbestos removal work area. Whether other areas may stay occupied depends on the risk assessment, the separation that can be achieved and the controls required for the job.</p>"),
]

ASB_BODY = page_hero(
    "asbestos-suit", "Worker in protective suit beside a sealed work area and bagged asbestos waste",
    [("/", "Home"), ("/asbestos-hazmat/", "Asbestos removal")],
    "Class A &amp; B licensed · Brisbane &amp; SEQ",
    "Asbestos removal <span>done properly.</span>",
    "Friable and bonded asbestos removal, site controls, waste documentation and clearance coordination — then the repair or reinstatement the property needs. One contractor from the first photo to close-out.",
    trust=["Friable &amp; bonded", "Roofs, walls &amp; ceilings", "Repair afterwards"]) + f'''

<section class="sec bone on-light" aria-label="Asbestos removal services"><div class="wrap split">
<aside class="aside">
<div class="mono label">On this page</div>
{toc([("what", "What we remove"), ("licence", "Class A &amp; Class B"), ("how", "How the job runs"), ("after", "After removal"), ("faq", "Questions")])}
{aside_card()}
</aside>
<div class="prose">
<h2 id="what">What we <span>remove.</span></h2>
<p>Most asbestos in Brisbane homes is bonded asbestos cement — the flat and corrugated “fibro” sheeting used through the 1950s to the 1980s. We also handle friable material that needs the tighter controls of a Class A licence.</p>
<ul>
<li><strong>Fibro walls and ceilings</strong> — bathrooms, laundries, enclosed verandahs, extensions and wall linings.</li>
<li><strong>Asbestos cement roof sheeting</strong> — corrugated roofs, gutters, downpipes and roof capping, with the new roof to follow.</li>
<li><strong>Eaves and soffit sheeting</strong> — often the first thing a painter or electrician disturbs.</li>
<li><strong>Wet-area splashbacks and underlay</strong> — behind tiles, under showers and beneath old vinyl.</li>
<li><strong>Vinyl floor tiles and backing</strong> — including layers hidden under newer floor coverings.</li>
<li><strong>Meter boards, fences, sheds and outbuildings</strong> — the small jobs that still need doing right.</li>
<li><strong>Friable asbestos</strong> — damaged or crumbling material, lagging and fire-damaged sheeting.</li>
</ul>
<div class="callout"><b>Found something suspect?</b><p>Stop work in that area, keep people away from it and do not sweep, vacuum or water-blast it. Take a photo from a safe distance and send it through. We will tell you the safe next step.</p></div>

<h2 id="licence">Class A <span>&amp; Class B.</span></h2>
<p>Queensland licenses asbestos removal by the type of material. Alliance holds the capability for both, so one contractor can take the whole job.</p>
<div class="facts">
<div><span class="mono">Class A</span><b>Friable asbestos</b><p>Any amount of friable asbestos, plus non-friable asbestos.</p></div>
<div><span class="mono">Class B</span><b>Bonded over 10 m²</b><p>More than 10 m² of non-friable asbestos. Not friable material.</p></div>
<div><span class="mono">No licence</span><b>10 m² or less</b><p>Non-friable only — and the work must still follow WHS Regulation Part 8.7.</p></div>
</div>
<p class="updated mono">Source: <a href="https://www.worksafe.qld.gov.au/licensing-and-registrations/asbestos-removal-and-licensing/which-businesses-are-licensed-to-remove-asbestos-in-queensland" rel="noopener">WorkSafe Queensland</a>. Detail in our <a href="/guides/asbestos-removal-rules-queensland/">Queensland rules guide</a>.</p>

<h2 id="how">How the job <span>runs.</span></h2>
<ol>
<li><strong>Photos and site details.</strong> You send the address, photos and what has been found. We work out whether an inspection or testing is needed first.</li>
<li><strong>Scope and price.</strong> We confirm the material, quantity, access, containment, disposal and clearance requirements, then give you the price before work is booked.</li>
<li><strong>Notifications and set-up.</strong> Required notifications are lodged, the work area is isolated and signed, and controls are set up for the material involved.</li>
<li><strong>Removal.</strong> Material is removed whole where possible, kept wet, wrapped and labelled. Nobody else enters the work area.</li>
<li><strong>Clean-up and clearance.</strong> The area is decontaminated. Where required, an independent assessor inspects and issues the clearance certificate.</li>
<li><strong>Waste and records.</strong> Waste goes to a licensed facility. Photos, waste documentation and completion records are kept with the job.</li>
</ol>
<figure class="media"><video controls preload="none" playsinline width="540" height="960" poster="/assets/img/site-video-poster-540.webp" style="max-width:420px"><source src="/assets/media/real-site-removal.mp4" type="video/mp4"></video><figcaption>Alliance on site: removal work underway at a Brisbane property.</figcaption></figure>

<h2 id="after">After <span>removal.</span></h2>
<p>Removal leaves a hole — a bathroom without walls, a roof without sheeting, a verandah without lining. Most asbestos contractors leave at that point. We do not have to: Alliance can carry the job through to new linings, roofing, carpentry and reinstatement so the room is back in use.</p>
<div class="duo">{pic("reinstatement-framing", "Garage wall framing and ceiling opened up during reinstatement", sizes="(max-width: 980px) 50vw, 25vw")}{pic("wall-reinstatement", "New plasterboard set on walls and ceiling during reinstatement", sizes="(max-width: 980px) 50vw, 25vw")}</div>
</div>
</div></section>

{era_check("Asbestos check")}

{faq_section(ASB_FAQ, "Asbestos questions", "Asbestos removal, plainly answered.")}

{band("Suspect asbestos? Send a photo before anyone touches it.")}

{quote_section("Asbestos & Hazmat", "Next step", "Get an asbestos removal quote.", "Send the address, a few photos and what has been found. We will confirm whether testing is needed and give you a clear scope and price before anything is booked.")}
'''

ASBESTOS = {
    "path": "/asbestos-hazmat/",
    "title": "Asbestos Removal Brisbane — Friable & Bonded | Alliance Group",
    "description": "Class A & B asbestos removal in Brisbane: fibro walls, ceilings, roofs, eaves and friable material. Notifications, clearance, waste records and repairs. 0403 126 276.",
    "preload": "asbestos-suit",
    "crumbs": [("/", "Home"), ("/asbestos-hazmat/", "Asbestos removal")],
    "faq": ASB_FAQ,
    "schema": [service_schema("Asbestos removal", "Asbestos removal", "/asbestos-hazmat/", "Class A friable and Class B non-friable asbestos removal with site controls, notifications, clearance coordination, waste documentation and reinstatement in Brisbane and South East Queensland.")],
    "body": ASB_BODY,
}

# ------------------------------------------------------------------ emergency
EMG_FAQ = [
    ("Do you attend after hours?",
     f"<p>Yes — emergency make-safe calls are taken 24/7. Call <a href=\"tel:{TEL}\">{PHONE}</a> and tell us whether the property is safe to enter, whether anyone is hurt, and what has been damaged. For immediate danger, call 000 first.</p>"),
    ("What does a make-safe include?",
     "<p>A make-safe controls the immediate risk: isolating damaged areas, temporary weatherproofing such as tarping, securing loose or broken material, and stopping further water entry. It is followed by a scope for the permanent repair.</p>"),
    ("Can asbestos be removed straight away after a storm?",
     "<p>Where damaged asbestos poses an imminent risk to the community if it is not immediately removed, Queensland has a class exemption that lets licensed removalists carry out urgent removal without the usual advance notice, with notification afterwards. It only applies to genuinely urgent work after the event. <a href=\"/guides/asbestos-after-storm-or-flood/\">More on asbestos after storms</a>.</p>"),
    ("Will you document the damage for insurance?",
     "<p>Yes. We photograph the condition found and the make-safe work, and keep job notes with the record so the owner, property manager or insurer can see what was done and why.</p>"),
    ("Do you do the repair as well?",
     "<p>Yes. Once the immediate risk is controlled we can scope and complete the roofing, building repair and reinstatement work — the same contractor from make-safe to finished repair.</p>"),
]

EMG_BODY = page_hero(
    "flooded-home", "Floodwater across the front yard and driveway of a house after heavy rain",
    [("/", "Home"), ("/emergency-response/", "Emergency response")],
    "24/7 emergency response · Brisbane &amp; SEQ",
    "Emergency make-safe <span>&amp; storm damage.</span>",
    "Storm, flood, fire or impact damage — we control the hazard, protect the property from further damage and carry it through to the repair. Including damaged asbestos sheeting.",
    actions=f'<a class="btn" href="tel:{TEL}">Call {PHONE}</a><a class="btn ghost" href="#quote">Send photos of the damage</a>',
    trust=["24/7 make-safe", "Storm &amp; water damage", "Through to repair"]) + f'''

<section class="emg" aria-labelledby="first-h" style="background:var(--green2)"><div class="wrap"><div class="emg-copy">
<span class="chip">First, stay safe</span>
<h2 id="first-h">Before we <span>get there.</span></h2>
<div class="alert"><span class="icon">{ICON_ALERT}</span><div><b>Suspected asbestos disturbed or damaged?</b><p>Keep people and pets away. Do not sweep, vacuum, water-blast or walk through broken sheeting. If it is safe, close windows and doors to the area.</p></div></div>
<div class="alert"><span class="icon">{ICON_ALERT}</span><div><b>Power, gas or structural risk?</b><p>Stay out of the building if there is any doubt, keep clear of fallen lines and call 000 or your energy provider first.</p></div></div>
<div class="actions"><a class="btn" href="tel:{TEL}">Call {PHONE}</a></div>
</div></div></section>

<section class="sec bone on-light" aria-label="Emergency response services"><div class="wrap split">
<aside class="aside">
<div class="mono label">On this page</div>
{toc([("what", "What we respond to"), ("how", "What happens"), ("asbestos", "Damaged asbestos"), ("faq", "Questions")])}
{aside_card("Damage right now?", "Call first. Photos can follow by text or the form.")}
</aside>
<div class="prose">
<h2 id="what">What we <span>respond to.</span></h2>
<ul>
<li><strong>Storm and wind damage</strong> — lifted or broken roof sheets, fallen branches, damaged eaves and fencing.</li>
<li><strong>Active roof leaks and water ingress</strong> — temporary weatherproofing, tarping and stopping further water entry.</li>
<li><strong>Flood and water damage</strong> — wet linings and floors opened up, drying set up and affected materials removed.</li>
<li><strong>Fire and impact damage</strong> — vehicle impact, fallen trees and fire-damaged structure made safe and secured.</li>
<li><strong>Damaged or broken asbestos</strong> — broken fibro, cracked roof sheeting and debris controlled and removed under licence.</li>
</ul>
<h2 id="how">What <span>happens.</span></h2>
{steps([("Call", "Tell us what has happened, whether the property is safe to enter and whether asbestos may be involved."), ("Make safe", "We isolate the hazard, weatherproof and secure the building and limit further damage."), ("Document", "Condition and works are photographed and noted for the owner, property manager or insurer."), ("Repair", "We scope and carry out the roofing, removal, remediation and reinstatement required.")], "steps light")}
<h2 id="asbestos">Damaged <span>asbestos.</span></h2>
<p>Storms do not care what a house is made of. Hail and wind break asbestos cement roof sheeting and fibro, and flood debris can carry broken material through a yard. Broken bonded sheeting is more likely to release fibres than intact sheeting, so it needs to be controlled before the clean-up starts.</p>
<p>Queensland allows licensed removalists to carry out urgent removal of damaged asbestos that poses an imminent risk to the community straight after a flood or severe storm, under a time-limited class exemption, with notification to the regulator afterwards. Removal later on — for example months later as part of an insurance claim — goes through normal advance notice. Our <a href="/guides/asbestos-after-storm-or-flood/">storm and flood guide</a> covers the details.</p>
<p class="updated mono">Source: <a href="https://www.asbestos.qld.gov.au/general-information/cleaning-after-floods-and-storms" rel="noopener">Queensland Government — cleaning after floods and storms</a></p>
</div>
</div></section>

{gallery_three([("damage-opening", "Opened ceiling showing damage requiring assessment", "01 Condition", "What we found"), ("site-protection", "Floors and fittings protected before works start", "02 Controls", "Protection in place"), ("ceiling-repair", "Ceiling repaired and patched after water damage", "03 Repair", "Back in use")])}

{faq_section(EMG_FAQ, "Emergency questions", "When it cannot wait.")}

{quote_section("Roofing & Make-Safe", "Next step", "Send photos of the damage.", "Call for anything active. If the immediate risk is controlled, send the address and photos and we will scope the make-safe and repair.")}
'''

EMERGENCY = {
    "path": "/emergency-response/",
    "title": "Emergency Make-Safe & Storm Damage Brisbane | 24/7 | Alliance Group",
    "description": "24/7 emergency make-safe in Brisbane & SEQ: storm, flood, fire and impact damage, roof tarping, water ingress and damaged asbestos — then the full repair. 0403 126 276.",
    "preload": "flooded-home",
    "crumbs": [("/", "Home"), ("/emergency-response/", "Emergency response")],
    "faq": EMG_FAQ,
    "schema": [service_schema("Emergency make-safe and storm damage response", "Emergency make-safe", "/emergency-response/", "24/7 emergency make-safe for storm, flood, fire and impact damage including temporary weatherproofing, damaged asbestos control and repair.")],
    "body": EMG_BODY,
}

# ------------------------------------------------------------------ roofing
ROOF_FAQ = [
    ("Can you replace an asbestos roof?",
     "<p>Yes. Asbestos cement roof sheeting is removed under the required licence and controls, waste is disposed of at a licensed facility, and we install the new roof. One contractor handles removal and replacement, so there is no gap between trades.</p>"),
    ("Should an old asbestos roof be repaired or replaced?",
     "<p>It depends on the condition of the sheeting and what the owner wants to achieve. Weathered or broken asbestos sheeting should not be water-blasted, cut or walked on carelessly. We look at the condition and give options before any work is done.</p>"),
    ("Do you find the cause of a roof leak?",
     "<p>Yes. We inspect the roof, flashings, gutters and likely entry points, then repair the cause rather than only patching the stain on the ceiling.</p>"),
    ("Can you repair the ceiling damage from a leak?",
     "<p>Yes. Water-damaged ceilings, linings and insulation can be removed and replaced as part of the same job once the roof is watertight.</p>"),
    ("Do you attend storm-damaged roofs?",
     "<p>Yes. We provide temporary protection such as tarping where required, then complete the repair or replacement once the condition is assessed. See <a href=\"/emergency-response/\">emergency response</a>.</p>"),
]

ROOF_BODY = page_hero(
    "tarp-roof", "Storm-damaged roof covered with a tarpaulin",
    [("/", "Home"), ("/roofing/", "Roofing")],
    "Roof repairs · Asbestos roofs · Make-safe",
    "Roofing built around <span>the cause.</span>",
    "Roof leaks, storm damage and asbestos cement roofs. We make it watertight, remove what needs to go and put the right roof back — then repair the ceilings the water got to.",
    trust=["Leak investigation", "Asbestos roof replacement", "Storm repairs"]) + f'''

<section class="sec bone on-light" aria-label="Roofing services"><div class="wrap split">
<aside class="aside">
<div class="mono label">On this page</div>
{toc([("services", "Roofing services"), ("asbestos-roof", "Asbestos roofs"), ("how", "How it runs"), ("faq", "Questions")])}
{aside_card("Roof leaking?", "Send a photo of the ceiling and the roof if you can see it safely.")}
</aside>
<div class="prose">
<h2 id="services">Roofing <span>services.</span></h2>
<ul>
<li><strong>Roof leak investigation and repair</strong> — flashings, penetrations, valleys, gutters and the real entry point.</li>
<li><strong>Storm-damage repairs</strong> — temporary protection first, then the permanent repair or replacement.</li>
<li><strong>Asbestos roof removal and replacement</strong> — licensed removal of asbestos cement sheeting and a new roof.</li>
<li><strong>Roof maintenance and restoration</strong> — keeping a sound roof sound and stopping small defects becoming leaks.</li>
<li><strong>Water-damaged ceilings and linings</strong> — removed, dried out and replaced once the roof is watertight.</li>
</ul>
<h2 id="asbestos-roof">Asbestos <span>roofs.</span></h2>
<p>Corrugated asbestos cement roofing was common on Queensland homes, garages, sheds and carports until the 1980s. After decades in the sun it weathers, cracks and becomes brittle — and that is when leaks start.</p>
<div class="callout"><b>Do not water-blast it</b><p>High-pressure cleaning, cutting with power tools, sanding and drilling all disturb asbestos cement. Neither should anyone walk on old sheeting — it can give way. Leave it until it has been assessed.</p></div>
<p>Because Alliance holds asbestos removal capability and does the roofing, an asbestos roof replacement is one job: notifications, controlled removal, licensed disposal, clearance where required, then the new roof, gutters and flashings.</p>
<h2 id="how">How it <span>runs.</span></h2>
{steps([("Inspect", "Roof, drainage and likely entry points are checked and photographed."), ("Options", "Defects, risks and practical repair or replacement options are documented."), ("Work", "The approved repair, restoration or replacement is completed."), ("Close out", "Completed work is checked and close-out records are provided.")], "steps light")}
</div>
</div></section>

{gallery_three([("roof-leak-home", "Family catching water from a ceiling leak in a kitchen", "01 The leak", "Water getting in"), ("reinstatement-framing", "Ceiling opened and framing exposed during repairs", "02 Opened up", "Finding the damage"), ("wall-reinstatement", "New plasterboard on walls and ceiling during reinstatement", "03 Reinstated", "Linings replaced")], "From leak to finished ceiling.", "Roof work is only finished when the inside is too. We repair the damage the water caused.")}

{faq_section(ROOF_FAQ, "Roofing questions", "Roofing, plainly answered.")}

{quote_section("Roofing & Make-Safe", "Next step", "Get a roofing quote.", "Send the address and photos of the roof and any ceiling damage. We will work out whether it is a repair, a restoration or a replacement.")}
'''

ROOFING = {
    "path": "/roofing/",
    "title": "Roof Repairs & Asbestos Roof Replacement Brisbane | Alliance Group",
    "description": "Roof leak repairs, storm damage and asbestos roof removal and replacement in Brisbane & SEQ — plus the water-damaged ceilings. One contractor. 0403 126 276.",
    "preload": "tarp-roof",
    "crumbs": [("/", "Home"), ("/roofing/", "Roofing")],
    "faq": ROOF_FAQ,
    "schema": [service_schema("Roof repairs and asbestos roof replacement", "Roofing", "/roofing/", "Roof leak investigation and repairs, storm damage repairs, and licensed asbestos cement roof removal with replacement roofing in Brisbane and South East Queensland.")],
    "body": ROOF_BODY,
}

# ------------------------------------------------------------------ mould
MOULD_FAQ = [
    ("Will cleaning the mould fix the problem?",
     "<p>Not on its own. Mould keeps coming back while the moisture source is still there. We find and fix the source — a leak, water ingress, poor ventilation or flood damage — then deal with the affected materials.</p>"),
    ("Do you remove mouldy plasterboard and carpet?",
     "<p>Yes. Materials that cannot be properly cleaned are removed under containment, the area is decontaminated and dried, then new linings and finishes go back in.</p>"),
    ("Can mould remediation and repairs be one job?",
     "<p>Yes. Alliance carries mould remediation through to replacement linings, repairs and reinstatement, so the room is ready to use again.</p>"),
    ("What if the damaged walls might contain asbestos?",
     "<p>In older homes, water-damaged linings may be fibro. We check before cutting into anything, and because we are licensed for asbestos removal, the job does not stall waiting for another contractor.</p>"),
    ("What should a property manager send?",
     "<p>The address, a few photos of the affected area and a short description. That is enough for us to work out the practical next step.</p>"),
]

MOULD_BODY = page_hero(
    "drying-fans", "Drying fans running on a stripped floor after water damage",
    [("/", "Home"), ("/mould-remediation/", "Mould & remediation")],
    "Moisture · Mould · Reinstatement",
    "Mould remediation <span>&amp; water damage.</span>",
    "Find the moisture source, remove what cannot be saved, decontaminate and dry the area — then rebuild it properly. For homes, rentals, strata and commercial properties.",
    trust=["Moisture source first", "Containment &amp; removal", "Rebuilt properly"]) + f'''

<section class="sec bone on-light" aria-label="Mould remediation services"><div class="wrap split">
<aside class="aside">
<div class="mono label">On this page</div>
{toc([("services", "What we do"), ("how", "How it runs"), ("asbestos", "Older buildings"), ("faq", "Questions")])}
{aside_card("Mould coming back?", "Send photos of the affected area and where you think the water is coming from.")}
</aside>
<div class="prose">
<h2 id="services">What we <span>do.</span></h2>
<ul>
<li><strong>Moisture-source investigation</strong> — roof leaks, plumbing, water ingress, condensation and poor ventilation.</li>
<li><strong>Mould remediation</strong> — containment, removal of affected materials and decontamination cleaning.</li>
<li><strong>Water damage and flood response</strong> — wet linings and floors opened up, affected materials removed, drying set up.</li>
<li><strong>Drying and moisture control</strong> — making sure the structure is dry before anything is closed back in.</li>
<li><strong>Reinstatement and repair</strong> — new linings, finishes and joinery so the area is usable again.</li>
</ul>
<h2 id="how">How it <span>runs.</span></h2>
{steps([("Find the source", "Identify the moisture source and the extent of affected materials."), ("Contain", "Define containment, removal and cleaning requirements for the area."), ("Remove &amp; clean", "Remove damaged materials, decontaminate and dry the work area."), ("Rebuild", "Confirm the area is ready, then complete the repair and reinstatement.")], "steps light")}
<h2 id="asbestos">Older <span>buildings.</span></h2>
<p>Mould and water damage in a pre-1990 building often sits behind fibro wall or ceiling sheeting. Cutting it out without checking can turn a mould job into an asbestos exposure. We check first, and if asbestos is involved we can remove it under licence as part of the same job.</p>
<div class="duo">{pic("moisture-damage", "Water-damaged timber and wet floor in a laundry", sizes="(max-width: 980px) 50vw, 25vw")}{pic("work-area-protection", "Floors protected with paper and tape before works", sizes="(max-width: 980px) 50vw, 25vw")}</div>
</div>
</div></section>

{faq_section(MOULD_FAQ, "Mould questions", "Mould and water damage, plainly answered.")}

{quote_section("Building & Remediation", "Next step", "Get the mould sorted at the source.", "Send the address, photos and where you think the water is coming from. We will work out the practical next step.")}
'''

MOULD = {
    "path": "/mould-remediation/",
    "title": "Mould Remediation & Water Damage Repairs Brisbane | Alliance Group",
    "description": "Mould remediation and water damage repairs in Brisbane & SEQ. We fix the moisture source, remove affected materials, decontaminate, dry and rebuild. 0403 126 276.",
    "preload": "drying-fans",
    "crumbs": [("/", "Home"), ("/mould-remediation/", "Mould & remediation")],
    "faq": MOULD_FAQ,
    "schema": [service_schema("Mould remediation and water damage repairs", "Mould remediation", "/mould-remediation/", "Moisture-source investigation, mould remediation, decontamination, drying and reinstatement in Brisbane and South East Queensland.")],
    "body": MOULD_BODY,
}

# ------------------------------------------------------------------ property managers
PM_FAQ = [
    ("A tenant says there is asbestos. What do I do first?",
     "<p>Ask the tenant to keep away from the material and not to disturb it, get photos and the location, and send them to us. We will tell you whether it needs testing, a make-safe or removal, and what the tenant needs to know in the meantime.</p>"),
    ("Can you deal with the tenant directly?",
     "<p>Yes, if you want us to. We can arrange access with the tenant and keep you updated on what was found and what happens next.</p>"),
    ("Do you send photos and records?",
     "<p>Yes. Condition photos, job notes, waste documentation and completion records are kept with the job, so you have something to put on the property file.</p>"),
    ("Can you handle the repair after removal?",
     "<p>Yes. Alliance can carry the job through removal, clearance coordination, repair and reinstatement, so you are not chasing separate contractors.</p>"),
    ("Do you work with strata and body corporate managers?",
     "<p>Yes. We work on common property and lots, and can provide the records committees need. For a wider records review, see <a href=\"/compliance-shield/\">Compliance Shield</a>.</p>"),
]

PM_BODY = page_hero(
    "completed-room", "Bedroom returned to use after repair",
    [("/", "Home"), ("/property-managers/", "Property managers & strata")],
    "Property managers · Strata · Landlords",
    "One call for the <span>property file.</span>",
    "When a tenant raises asbestos, a trade uncovers suspect material, or a leak turns into mould — one contractor to make it safe, remove it, repair it and give you the records.",
    trust=["Tenant issues handled", "Photos &amp; records", "Removal to repair"]) + f'''

<section class="sec bone on-light" aria-label="For property managers"><div class="wrap split">
<aside class="aside">
<div class="mono label">On this page</div>
{toc([("jobs", "Jobs we take off your desk"), ("you-get", "What you get"), ("faq", "Questions")])}
{aside_card("Got a job now?", "Send the address, tenant access details and photos.")}
</aside>
<div class="prose">
<h2 id="jobs">Jobs we take <span>off your desk.</span></h2>
<ul>
<li><strong>Tenant asbestos concerns</strong> — cracked fibro, damaged eaves, a broken meter board, an old bathroom.</li>
<li><strong>Suspect material found by another trade</strong> — the electrician or plumber stops work and you need someone now.</li>
<li><strong>Leaks, water damage and mould</strong> — source found, affected materials removed, the room rebuilt.</li>
<li><strong>Storm and impact damage</strong> — make-safe, documentation and the repair.</li>
<li><strong>Vacate and pre-renovation work</strong> — asbestos removal and repairs between tenancies.</li>
</ul>
<h2 id="you-get">What <span>you get.</span></h2>
<div class="facts">
<div><span class="mono">01</span><b>One contact</b><p>Hazard, removal and repair under one contractor.</p></div>
<div><span class="mono">02</span><b>Clear updates</b><p>What was found, what happens next and what is holding the job up.</p></div>
<div><span class="mono">03</span><b>The records</b><p>Photos, waste documentation and completion records for the file.</p></div>
</div>
<p>For portfolios, strata schemes and community sites that need their records brought up to date — registers, photos and contractor history — <a href="/compliance-shield/">Compliance Shield</a> builds a clean site record.</p>
</div>
</div></section>

{faq_section(PM_FAQ, "Property manager questions", "For the people who get the call.")}

{quote_section("Property Managers & Strata", "Next step", "Send the job through.", "Address, tenant access details, photos and a short description. We will work out the practical next step and keep you updated.")}
'''

PROPERTY_MANAGERS = {
    "path": "/property-managers/",
    "title": "Asbestos & Repairs for Property Managers & Strata | Brisbane | Alliance Group",
    "description": "Tenant asbestos concerns, suspect material, leaks, mould and storm damage for Brisbane property managers and strata — removal, repair and records from one contractor.",
    "preload": "completed-room",
    "crumbs": [("/", "Home"), ("/property-managers/", "Property managers & strata")],
    "faq": PM_FAQ,
    "schema": [service_schema("Asbestos and repairs for property managers and strata", "Property maintenance and hazardous materials", "/property-managers/", "Tenant asbestos concerns, suspect materials, make-safe, removal, repairs and records for property managers, landlords and strata in Brisbane and South East Queensland.")],
    "body": PM_BODY,
}

# ------------------------------------------------------------------ compliance shield
CS_FAQ = [
    ("What is a Baseline Compliance Review?",
     "<p>It is the first step: a review of the site’s current photos, registers, history and contractor controls so you can see what is current, what is missing and what should be tightened up.</p>"),
    ("Who is Compliance Shield for?",
     "<p>Churches, childcare, aged care, retirement living, community facilities, property managers and strata — sites where people need to be able to show what is on site and who has worked there.</p>"),
    ("Do we have to sign up for ongoing oversight?",
     "<p>No. Start with the overview and the Baseline Compliance Review. Ongoing oversight is only there if you need it.</p>"),
    ("How do we start?",
     "<p>Request the overview using the form on this page or call us. We will explain how the review works for your site.</p>"),
]

CS_BODY = f'''<div class="phero" style="background:#0b0c0c">
{pic("containment", "Work area sealed with plastic sheeting and marked during asbestos works", eager=True, style="filter:grayscale(1) contrast(1.1)")}
<div class="wrap hero-copy">
<nav aria-label="Breadcrumb"><ol class="crumbs mono"><li><a href="/">Home</a></li><li aria-current="page">Compliance Shield™</li></ol></nav>
<div class="kicker">Compliance Shield™ · Site records</div>
<h1>She’ll be right <span>is not a system.</span></h1>
<p class="lede">Missing registers, outdated photos and files spread across five inboxes create stress when proof is needed. Compliance Shield builds a cleaner site record — photos, registers, history and contractor controls.</p>
<div class="actions"><a class="btn" href="#quote">Request the overview</a><a class="btn ghost" href="tel:{TEL}">Call {PHONE}</a></div>
</div>
</div>

<section class="shield" aria-labelledby="gaps-h"><div class="wrap">
<div class="mono label">The three gaps</div>
<h2 id="gaps-h" style="font-size:96px">Where proof <span>falls over.</span></h2>
<div class="gaps">
<div><span class="mono">Gap 01</span><b>Photos</b><p>Site photos that are old, missing or do not show the current condition.</p></div>
<div><span class="mono">Gap 02</span><b>Registers</b><p>Registers that no longer match what is actually on site.</p></div>
<div><span class="mono">Gap 03</span><b>Contractor controls</b><p>No clear record of who worked on site and under what controls.</p></div>
</div>
<ol class="path"><li class="on">1. Overview</li><i aria-hidden="true">→</i><li>2. Baseline Compliance Review</li><i aria-hidden="true">→</i><li>3. Ongoing oversight, if needed</li></ol>
<p class="for"><b>Built for</b> churches, childcare, aged care, retirement living, community facilities, property managers and strata.</p>
</div></section>

<section class="sec bone on-light" aria-label="How Compliance Shield works"><div class="wrap split">
<aside class="aside">{aside_card("Start with the overview", "No commitment. We explain how the review works for your site.")}</aside>
<div class="prose">
<h2>How it <span>works.</span></h2>
<ol>
<li><strong>Overview.</strong> A short conversation about the site, what records exist and where they live.</li>
<li><strong>Baseline Compliance Review.</strong> We review the site’s photos, registers, history and contractor controls, and show you what is current, what is missing and what should be tightened up.</li>
<li><strong>Ongoing oversight, if needed.</strong> Keeping the record current as work happens on site — only if it is useful to you.</li>
</ol>
<h2>What it <span>builds.</span></h2>
<ul>
<li><strong>A current photo record</strong> of the site condition, not a folder of old images.</li>
<li><strong>Registers that match the site</strong> — checked against what is actually there.</li>
<li><strong>Site history</strong> — what work was done, where and when.</li>
<li><strong>Contractor controls</strong> — who worked on site and under what controls.</li>
</ul>
<div class="callout"><b>Why it matters</b><p>When something goes wrong, or someone asks for proof, the question is always the same: what is on site, and who touched it? Compliance Shield is about being able to answer that without digging through five inboxes.</p></div>
</div>
</div></section>

{faq_section(CS_FAQ, "Compliance Shield questions", "Before you request the overview.")}

{quote_section("Compliance Shield overview", "Next step", "Request the overview.", "Tell us about the site and who looks after it. We will explain how the Baseline Compliance Review works for you.")}
'''

COMPLIANCE = {
    "path": "/compliance-shield/",
    "title": "Compliance Shield™ — Site Photos, Registers & Contractor Records | Alliance Group",
    "description": "Compliance Shield builds a clean site record — current photos, registers, history and contractor controls — for churches, childcare, aged care, community sites and strata.",
    "preload": "containment",
    "crumbs": [("/", "Home"), ("/compliance-shield/", "Compliance Shield™")],
    "faq": CS_FAQ,
    "schema": [service_schema("Compliance Shield", "Site compliance records review", "/compliance-shield/", "Baseline Compliance Review of site photos, registers, history and contractor controls, with optional ongoing oversight.")],
    "body": CS_BODY,
}

# ------------------------------------------------------------------ about
ABOUT_BODY = page_hero(
    "danger-tape", "Site fenced off with asbestos dust hazard tape, a work vehicle and a skip bin",
    [("/", "Home"), ("/about/", "About")],
    "About Alliance Group",
    "Structure. Safety. <span>Standards.</span>",
    "A Brisbane-based asbestos, hazardous-material and building response contractor. One accountable team from the hazard to the finished repair.") + f'''

<section class="light" aria-labelledby="about-h"><div class="wrap">
<div class="why" style="margin-top:0">
<figure class="shot">{pic("containment", "Work area sealed with plastic sheeting and marked during asbestos works", sizes="(max-width: 980px) 100vw, 40vw")}<figcaption class="plate mono">Alliance project photograph</figcaption></figure>
<div>
<div class="mono label">Who we are</div>
<h2 id="about-h">One team across <span>connected risks.</span></h2>
<p class="lede">Alliance Group brings asbestos removal, hazardous-material work, roofing and building repair into one practical service. The focus is straightforward: understand the cause, control the risk, document the work and complete the right repair or reinstatement.</p>
<p class="lede">We work across Brisbane, Moreton Bay, Ipswich, Logan, Redlands and wider South East Queensland for homeowners, landlords, property managers, strata, commercial and facilities managers, and insurance builders.</p>
<div class="points">
<div>{TICK}<div><h3>Class A &amp; B asbestos</h3><p>Friable and bonded asbestos removal under licence.</p></div></div>
<div>{TICK}<div><h3>Hazard to repair</h3><p>Removal, make-safe, remediation and the repair that follows.</p></div></div>
<div>{TICK}<div><h3>Records kept</h3><p>Photos, job notes, waste documentation and completion records.</p></div></div>
<div>{TICK}<div><h3>Straight answers</h3><p>What was found, what happens next, and what it will cost before it is booked.</p></div></div>
</div>
</div>
</div>
</div></section>

<section class="process" aria-labelledby="svc2-h"><div class="wrap">
<div class="head"><div><div class="mono label">Services</div><h2 id="svc2-h">What we <span>do.</span></h2></div><p>Every service is built around the same idea: control the risk, then fix the building.</p></div>
{link_cards([
    {"href": "/asbestos-hazmat/", "tag": "01", "title": "Asbestos &amp; Hazmat", "text": "Friable and bonded asbestos removal, site controls and documentation.", "more": "Asbestos removal"},
    {"href": "/emergency-response/", "tag": "02", "title": "Emergency response", "text": "24/7 make-safe for storm, flood, fire and impact damage.", "more": "Emergency"},
    {"href": "/roofing/", "tag": "03", "title": "Roofing", "text": "Leak repairs, storm damage and asbestos roof replacement.", "more": "Roofing"},
    {"href": "/mould-remediation/", "tag": "04", "title": "Mould &amp; remediation", "text": "Moisture source, mould removal, drying and reinstatement.", "more": "Mould"},
    {"href": "/property-managers/", "tag": "05", "title": "Property managers", "text": "Tenant issues, suspect material and records for the file.", "more": "Property managers"},
    {"href": "/compliance-shield/", "tag": "06", "title": "Compliance Shield™", "text": "Photos, registers, history and contractor controls.", "more": "Compliance Shield"},
])}
</div></section>

{quote_section("", "Next step", "Talk to Alliance.")}
'''

ABOUT = {
    "path": "/about/",
    "title": "About Alliance Group | Brisbane Asbestos & Building Response",
    "description": "Alliance Group is a Brisbane-based Class A & B asbestos removal and building response contractor — from hazard control and removal to finished repair across SEQ.",
    "preload": "danger-tape",
    "crumbs": [("/", "Home"), ("/about/", "About")],
    "body": ABOUT_BODY,
}

# ------------------------------------------------------------------ contact
CONTACT_BODY = page_hero(
    None, "", [("/", "Home"), ("/contact/", "Contact")],
    "Contact Alliance Group",
    "Talk to us <span>about the property.</span>",
    "Call for anything urgent. For everything else, send the address, photos and a short description and we will work out the practical next step.",
    actions=f'<a class="btn" href="tel:{TEL}">Call {PHONE}</a><a class="btn ghost" href="mailto:{EMAIL}">Email us</a><a class="btn ghost" href="/intake/">Full details &amp; documents →</a>',
    plain=True) + f'''

<section class="sec bone on-light" aria-labelledby="c-h"><div class="wrap">
<div class="head"><div><div class="mono label">Contact details</div><h2 id="c-h">Phone, email, <span>or the form.</span></h2></div><p>We service Brisbane and South East Queensland. Emergency make-safe calls are taken 24/7.</p></div>
<div class="facts" style="grid-template-columns:repeat(3,minmax(0,1fr))">
<div><span class="mono">Phone</span><b><a href="tel:{TEL}" style="color:inherit;text-decoration:none">{PHONE}</a></b><p>Fastest for urgent damage or disturbed asbestos.</p></div>
<div><span class="mono">Email</span><b style="text-transform:none;font-size:24px"><a href="mailto:{EMAIL}" style="color:inherit;text-decoration:none;overflow-wrap:anywhere">{EMAIL}</a></b><p>Photos, reports and documents welcome.</p></div>
<div><span class="mono">Service area</span><b>Brisbane &amp; SEQ</b><p><a href="/service-areas/">See the areas we cover</a>.</p></div>
</div>
<p style="margin-top:28px;color:var(--inkbody)">Happy with our work? <a href="{REVIEW_URL}" rel="noopener" target="_blank">Leave us a Google review ↗</a></p>
</div></section>

{quote_section("", "Send an enquiry", "Send the property details.")}
'''

CONTACT = {
    "path": "/contact/",
    "title": "Contact Alliance Group | 0403 126 276 | Brisbane & SEQ",
    "description": "Call 0403 126 276 or email info@alliancegroups.com.au for asbestos removal, emergency make-safe, roofing and mould remediation across Brisbane and South East Queensland.",
    "crumbs": [("/", "Home"), ("/contact/", "Contact")],
    "body": CONTACT_BODY,
}

# ------------------------------------------------------------------ intake (detailed form)
def radios(name, options, required=True):
    out = []
    for i, v in enumerate(options):
        req = " required" if (required and i == 0) else ""
        out.append(f'<label class="pick"><input type="radio" name="{name}" value="{esc(v)}"{req}><span>{esc(v)}</span></label>')
    return "".join(out)


INTAKE_FORM = f'''<form class="form enquiry-form" id="project-intake" data-form-type="detailed" action="{API}" method="post" enctype="multipart/form-data">
<div class="form-body">
<input type="hidden" name="formKind" value="detailed">
<div class="trap" aria-hidden="true"><label>Leave this field empty<input type="text" name="_hp" tabindex="-1" autocomplete="off"></label></div>
<fieldset><legend class="step-l mono"><span>01</span> <span>What’s the situation?</span></legend>
<div class="picks">{radios("service", ["Asbestos concern", "Water damage / mould", "Roof leak / damage", "Building repair", "Make-safe urgent", "Not sure — need advice"])}</div>
<p class="fine">Choose the closest match. We will confirm the right scope with you.</p></fieldset>
<fieldset><legend class="step-l mono"><span>02</span> <span>How urgent is this?</span></legend>
<div class="picks odd">{radios("urgency", ["Urgent — needs attention today/tomorrow", "This week", "Planning ahead — no rush"])}</div>
<p class="fine"><strong>Urgent jobs:</strong> we aim to call back within one hour during operating hours. For anything active, <a href="tel:{TEL}">call {PHONE}</a>.</p></fieldset>
<fieldset><legend class="step-l mono"><span>03</span> <span>What type of property?</span></legend>
<div class="picks odd">{radios("property", ["Rental / investment", "Strata / body corporate", "Home I own", "Commercial / business", "Other"])}</div></fieldset>
<fieldset><legend class="step-l mono"><span>04</span> <span>Where and who</span></legend>
<div class="fields">
<label class="full" for="intake-address">Property address or suburb *<input id="intake-address" name="siteAddress" required minlength="2" maxlength="300" autocomplete="street-address" placeholder="e.g. Chermside or 12 Example Street, Chermside"></label>
<label for="intake-name">Your name *<input id="intake-name" name="name" required minlength="2" maxlength="120" autocomplete="name"></label>
<label for="intake-phone">Your best number *<input id="intake-phone" type="tel" name="phone" required minlength="7" maxlength="20" inputmode="tel" autocomplete="tel"></label>
<label class="full" for="intake-email">Email <span class="opt">(optional — we send your job reference)</span><input id="intake-email" type="email" name="email" maxlength="254" autocomplete="email"></label>
</div>
<p class="step-l mono" style="margin-top:18px"><span>Best time to call?</span></p>
<div class="picks odd">{radios("bestTime", ["Morning", "Afternoon", "Anytime"], required=False)}</div>
</fieldset>
<fieldset><legend class="step-l mono"><span>05</span> <span>Tell us a bit more</span> <span class="opt">optional</span></legend>
<div class="fields"><label class="full" for="intake-message">What has happened?<textarea id="intake-message" name="message" maxlength="1500" rows="4" placeholder="e.g. Ceiling sheet damaged, tenant found it, 1980s home"></textarea></label></div>
<div class="upload"><input id="intake-files" type="file" name="files" multiple accept="image/jpeg,image/png,application/pdf,.jpg,.jpeg,.png,.pdf" aria-describedby="file-guidance"><p id="file-guidance">Photos help us give you a faster, more accurate response. Up to 10 JPG, PNG or PDF files, 20 MB per file. <span data-file-count></span></p></div>
</fieldset>
<label class="consent" for="intake-consent"><input id="intake-consent" type="checkbox" name="consent" value="yes" required><span>I agree to Alliance Group contacting me about this enquiry. <a href="/privacy/">Privacy information</a>.</span></label>
<button class="btn" type="submit">Request a site response</button>
<small>If it’s urgent, call us directly now: <a href="tel:{TEL}">{PHONE}</a>.</small>
</div>
<div class="form-done" aria-live="polite">
<span class="ok">{ICON_TICK}</span>
<h3 data-done-title>Request received.</h3>
<p>We will call you on the number you gave to work out the next step. If it is urgent, call {PHONE} now.</p>
<div class="actions"><a class="btn" href="tel:{TEL}">Call {PHONE}</a><button class="btn ghost ink" type="button" data-again>Send another request</button></div>
</div>
<p class="form-status" role="status" aria-live="polite" tabindex="-1" hidden></p>
<div class="form-error-help" hidden><p>Call <a href="tel:{TEL}">{PHONE}</a> or <a class="email-enquiry" href="mailto:{EMAIL}">email your enquiry</a>. Your entered details stay on this page.</p></div>
<noscript><p class="fine">To send this form, enable JavaScript or email <a href="mailto:{EMAIL}">{EMAIL}</a>.</p></noscript>
</form>'''

INTAKE_BODY = page_hero(
    None, "", [("/", "Home"), ("/intake/", "Request a site response")],
    "Request a site response",
    "Tell us about <span>the property.</span>",
    "Asbestos concerns, urgent make-safe, water damage, mould, roofing and building repairs across Brisbane and SEQ. Send the details — we will work out the practical next step.",
    actions=f'<a class="btn ghost" href="tel:{TEL}">Urgent? Call {PHONE}</a>', plain=True) + f'''

<section class="next" id="quote" aria-label="Project intake form"><div class="wrap">
<div>
<div class="mono label">What happens next</div>
<h2>We call. <span style="color:var(--copper)">You get a plan.</span></h2>
<ol class="steps compact">
<li><b aria-hidden="true">01</b><h3>We review it</h3><p>Your details, photos and documents are reviewed against what the job needs.</p></li>
<li><b aria-hidden="true">02</b><h3>We call you</h3><p>We confirm the scope, any inspection or testing, and access.</p></li>
<li><b aria-hidden="true">03</b><h3>You get the price</h3><p>Clear scope and price before anything is booked.</p></li>
</ol>
<div class="contact-lines">
<a href="tel:{TEL}"><span class="mono">Phone</span><b>{PHONE}</b></a>
<a href="mailto:{EMAIL}"><span class="mono">Email</span><b class="em">{EMAIL}</b></a>
</div>
</div>
{INTAKE_FORM}
</div></section>
'''

INTAKE = {
    "path": "/intake/",
    "title": "Request a Site Response | Asbestos, Make-Safe & Repairs | Alliance Group",
    "description": "Send the property address, urgency, photos and documents to Alliance Group for asbestos, make-safe, water damage, mould, roofing and repair work in Brisbane & SEQ.",
    "crumbs": [("/", "Home"), ("/intake/", "Request a site response")],
    "body": INTAKE_BODY,
}

# ------------------------------------------------------------------ blog (Soro)
BLOG_BODY = page_hero(
    None, "", [("/", "Home"), ("/blog/", "Latest articles")],
    "Alliance Group · Guides &amp; updates",
    "Asbestos &amp; <span>building articles.</span>",
    "Plain-English guidance on asbestos, mould, roofing and property compliance for owners, strata committees and property managers across Brisbane and South East Queensland.",
    actions=f'<a class="btn" href="/guides/">Core guides</a><a class="btn ghost" href="tel:{TEL}">Call {PHONE}</a>', plain=True) + f'''

<section class="sec bone on-light" aria-label="Core guides"><div class="wrap">
<div class="head"><div><div class="mono label">Start here</div><h2>Core <span>guides.</span></h2></div><p>The questions we answer most often, in one place.</p></div>
{link_cards(GUIDE_CARDS)}
</div></section>

<section class="sec" aria-label="Latest articles"><div class="wrap">
<div class="mono label">Latest articles</div>
<div id="soro-blog"></div>
<noscript><p>Our articles need JavaScript to display. For advice on a property, call {PHONE} or <a href="/intake/">start an enquiry</a>.</p></noscript>
</div></section>

{quote_section("", "Next step", "Got a question about a property?")}
'''

BLOG = {
    "path": "/blog/",
    "title": "Asbestos, Mould & Roofing Articles | Alliance Group Brisbane",
    "description": "Articles and updates on asbestos, mould, roofing and property compliance for Brisbane homeowners, property managers and strata committees.",
    "crumbs": [("/", "Home"), ("/blog/", "Latest articles")],
    "head": f'<script src="{SORO}" defer></script>',
    "body": BLOG_BODY,
}

# ------------------------------------------------------------------ privacy
PRIVACY_BODY = page_hero(
    None, "", [("/", "Home"), ("/privacy/", "Privacy")],
    "Privacy &amp; your enquiry",
    "How we use <span>your details.</span>",
    "What we collect when you contact us, why, and how to ask about it.", actions="", plain=True) + f'''

<section class="sec bone on-light" aria-label="Privacy information"><div class="wrap">
<div class="prose">
<h2>What we <span>collect.</span></h2>
<p>When you send an enquiry we collect the details you enter — usually your name, phone number, email address, the property address or suburb, a description of the issue, and any photos or documents you choose to attach.</p>
<h2>Why we <span>use it.</span></h2>
<p>We use the contact details, property information and supporting files you provide to assess and respond to your enquiry, to arrange any inspection or work, and to keep records of work we carry out. Submit only information relevant to the work; avoid including identity documents or other unnecessary personal information.</p>
<h2>Where it <span>goes.</span></h2>
<p>Enquiries are processed through our Google Firebase service and notification emails are addressed to {EMAIL}. Supporting files are stored with the enquiry. We do not sell your information.</p>
<h2>Analytics.</h2>
<p>Website analytics (Google Analytics) record page visits and actions such as enquiry submissions and contact-link clicks. Form answers and uploaded files are not sent to analytics.</p>
<h2>Questions.</h2>
<p>For questions about your information, or to ask us to correct it, email <a href="mailto:{EMAIL}">{EMAIL}</a> or call <a href="tel:{TEL}">{PHONE}</a>.</p>
<p class="updated mono">Last updated {UPDATED_TEXT}</p>
</div>
</div></section>

{quote_section("", "Next step", "Questions about your enquiry?")}
'''

PRIVACY = {
    "path": "/privacy/",
    "title": "Privacy & Your Enquiry | Alliance Group",
    "description": "How Alliance Group collects and uses the details, photos and documents you send with an enquiry, and how to contact us about your information.",
    "crumbs": [("/", "Home"), ("/privacy/", "Privacy")],
    "body": PRIVACY_BODY,
}

# ------------------------------------------------------------------ 404
NOT_FOUND = {
    "path": "/404.html",
    "title": "Page not found | Alliance Group",
    "description": "That page could not be found.",
    "robots": "noindex,follow",
    "canonical": False,
    "sitemap": False,
    "body": f'''<div class="phero plain nf"><div class="wrap hero-copy">
<div class="kicker">404 · Page not found</div>
<h1>That page has <span>moved.</span></h1>
<p class="lede">The page you were after is not here. Try one of these, or call us.</p>
<div class="actions"><a class="btn" href="/">Home</a><a class="btn ghost" href="/asbestos-hazmat/">Asbestos removal</a><a class="btn ghost" href="/emergency-response/">Emergency</a><a class="btn ghost" href="tel:{TEL}">{PHONE}</a></div>
</div></div>
{quote_section("", "Next step")}''',
}

PAGES = [HOME, ASBESTOS, EMERGENCY, ROOFING, MOULD, PROPERTY_MANAGERS, COMPLIANCE, ABOUT, CONTACT, INTAKE, BLOG, PRIVACY, NOT_FOUND]
