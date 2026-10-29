"""Service-area pages. Local details checked against council and national sources, October 2026."""
from build import PHONE, TEL, pic, quote_section, faq_section, page_hero, link_cards, service_schema, band

SERVICE_CARDS = [
    {"href": "/asbestos-hazmat/", "tag": "01", "title": "Asbestos removal", "text": "Friable and bonded asbestos — fibro walls, ceilings, roofs, eaves and floors.", "more": "Asbestos removal"},
    {"href": "/emergency-response/", "tag": "02", "title": "Emergency make-safe", "text": "Storm, flood, fire and impact damage, including broken asbestos sheeting.", "more": "Emergency"},
    {"href": "/roofing/", "tag": "03", "title": "Roofing", "text": "Leaks, storm damage and asbestos roof removal and replacement.", "more": "Roofing"},
    {"href": "/mould-remediation/", "tag": "04", "title": "Mould &amp; water damage", "text": "Moisture source, mould removal, drying and the rebuild.", "more": "Mould"},
]


def suburbs(names):
    return '<ul class="suburbs">' + "".join(f"<li>{n}</li>" for n in names) + "</ul>"


def area_page(slug, area, council, image, alt, kicker, lede, intro_html, subs, disposal_html, sources, faq, title, description):
    path = f"/{slug}/"
    crumb = [("/", "Home"), ("/service-areas/", "Areas we cover"), (path, area)]
    src = "".join(f'<li><a href="{u}" rel="noopener">{t}</a></li>' for t, u in sources)
    body = page_hero(image, alt, crumb, kicker, f"Asbestos removal <span>{area}.</span>", lede,
                     trust=["Class A &amp; B asbestos", "Emergency response", "Repair &amp; reinstatement"]) + f'''

<section class="sec bone on-light" aria-label="Asbestos removal in {area}"><div class="wrap split">
<aside class="aside">
<div class="mono label">Suburbs we cover</div>
{suburbs(subs)}
<p style="margin:18px 0 22px;color:var(--inkbody);font-size:15px">Not listed? We cover the whole {council} area — <a href="tel:{TEL}" style="color:var(--copperdk);font-weight:700">call {PHONE}</a>.</p>
<div class="card"><h3>Got a job in {area}?</h3><p>Send the address and a few photos. We will tell you the practical next step.</p><a class="btn" href="#quote">Get a quote</a><a class="btn ghost" href="tel:{TEL}">{PHONE}</a></div>
</aside>
<div class="prose">
{intro_html}
<h2>Asbestos waste <span>in {area}.</span></h2>
{disposal_html}
<div class="sources"><h2>Sources</h2><ul>{src}</ul><p class="updated mono">Checked October 2026. Facility rules change — confirm before you go.</p></div>
</div>
</div></section>

<section class="sec" aria-labelledby="svc-{slug}"><div class="wrap">
<div class="head"><div><div class="mono label">In {area}</div><h2 id="svc-{slug}">What we do <span>locally.</span></h2></div><p>The same contractor from hazard to finished repair, wherever the property is in {area}.</p></div>
{link_cards(SERVICE_CARDS, "cards four")}
</div></section>

{faq_section(faq, f"{area} questions", f"Asbestos in {area}, answered.")}

{quote_section("Asbestos & Hazmat", "Next step", f"Get an asbestos quote in {area}.", "Send the address, a few photos and what has been found. We will confirm whether testing is needed and give you a clear scope and price before anything is booked.")}
'''
    return {
        "path": path, "title": title, "description": description, "preload": image, "crumbs": crumb, "faq": faq,
        "schema": [service_schema(f"Asbestos removal {area}", "Asbestos removal", path, f"Class A and Class B asbestos removal, emergency make-safe and repairs in {area}.")],
        "body": body,
    }


COMMON_RULE = ('<p>In Queensland, a licence is not needed to remove 10 m² or less of non-friable (bonded) asbestos — but the work still has to follow the Work Health and Safety Regulation, and the waste still has to be disposed of properly. More than 10 m² of bonded asbestos needs a Class B licence; any friable asbestos needs Class A. '
               '<a href="/guides/asbestos-removal-rules-queensland/">How the rules work</a>.</p>')

MORETON = area_page(
    "asbestos-removal-moreton-bay", "Moreton Bay", "City of Moreton Bay", "danger-tape",
    "Site fenced off with asbestos dust hazard tape, a work vehicle and a skip bin",
    "Strathpine · North Lakes · Redcliffe · Caboolture",
    "Licensed Class A and Class B asbestos removal across the City of Moreton Bay — from Albany Creek and Strathpine to Redcliffe, North Lakes and Caboolture. Then the repair that follows.",
    '''<h2>Asbestos removal <span>across Moreton Bay.</span></h2>
<p>Moreton Bay runs from the established suburbs on Brisbane’s northern edge — Albany Creek, Strathpine, Lawnton and Petrie — out to the Redcliffe Peninsula and up through Burpengary, Morayfield and Caboolture. Plenty of homes, sheds and garages across the region were built before 1990, when asbestos cement sheeting was a standard building product.</p>
<p>We remove fibro walls and ceilings, asbestos cement roofs, eaves, splashbacks, vinyl underlay and damaged material after storms, and we can carry the job through to the new linings, roof or repair.</p>''' + COMMON_RULE,
    ["Strathpine", "Bray Park", "Lawnton", "Petrie", "Kallangur", "Murrumba Downs", "North Lakes", "Mango Hill", "Albany Creek", "Eatons Hill", "Redcliffe", "Scarborough", "Margate", "Deception Bay", "Burpengary", "Narangba", "Morayfield", "Caboolture"],
    '''<p>The national asbestos disposal facility finder lists two Moreton Bay facilities that accept both residential and commercial asbestos loads: the <strong>Dakabin Waste Management Facility</strong> and the <strong>Caboolture Waste Management Facility</strong>. Both list <strong>24 hours’ notice</strong> as a requirement, so do not turn up unannounced.</p>
<p>Asbestos must be wrapped and handled correctly before it is transported. If the job is more than a small amount of bonded sheeting, or the material is broken or friable, it is safer and simpler to have it removed and disposed of by a licensed removalist — the waste documentation then comes with the job.</p>''',
    [("Asbestos Safety and Eradication Agency — Dakabin Waste Management Facility", "https://www.asbestossafety.gov.au/node/132"),
     ("Asbestos Safety and Eradication Agency — Caboolture Waste Management Facility", "https://www.asbestossafety.gov.au/node/72"),
     ("WorkSafe Queensland — who can remove asbestos", "https://www.worksafe.qld.gov.au/licensing-and-registrations/asbestos-removal-and-licensing/which-businesses-are-licensed-to-remove-asbestos-in-queensland")],
    [("Do you cover the Redcliffe Peninsula and Caboolture?", "<p>Yes. We cover the whole City of Moreton Bay, from Albany Creek and Strathpine through North Lakes, the Redcliffe Peninsula, Burpengary, Morayfield and Caboolture.</p>"),
     ("Where can asbestos be dumped in Moreton Bay?", "<p>The national disposal facility finder lists the Dakabin and Caboolture waste management facilities as accepting residential and commercial asbestos with 24 hours’ notice. Check with the facility before you go, or have a licensed removalist handle disposal.</p>"),
     ("Can you replace an asbestos garage or shed roof?", "<p>Yes. We remove asbestos cement roof sheeting under licence and can install the new roof as part of the same job. See <a href=\"/roofing/\">roofing</a>.</p>"),
     ("A storm has broken fibro sheeting. What should I do?", f"<p>Keep people away from it, do not sweep or water-blast it, and call <a href=\"tel:{TEL}\">{PHONE}</a>. Read <a href=\"/guides/asbestos-after-storm-or-flood/\">asbestos after a storm</a>.</p>")],
    "Asbestos Removal Moreton Bay | Strathpine to Caboolture | Alliance Group",
    "Licensed Class A & B asbestos removal across Moreton Bay — Strathpine, North Lakes, Redcliffe, Caboolture. Disposal info, make-safe and repairs. Call 0403 126 276.",
)

IPSWICH = area_page(
    "asbestos-removal-ipswich", "Ipswich", "City of Ipswich", "reinstatement-framing",
    "Garage wall framing and ceiling opened up during reinstatement",
    "Ipswich · Goodna · Springfield · Rosewood",
    "Licensed Class A and Class B asbestos removal across the City of Ipswich — older homes in Booval, Bundamba and North Ipswich through to Goodna, Springfield and Rosewood.",
    '''<h2>Asbestos removal <span>across Ipswich.</span></h2>
<p>Ipswich is one of Queensland’s oldest cities, and its older suburbs are full of timber and fibro homes, extensions and outbuildings built well before 1990. Renovating, re-roofing or repairing one of these houses often means dealing with asbestos cement sheeting first.</p>
<p>We remove fibro wall and ceiling sheeting, asbestos roofs, eaves, wet-area linings and damaged material, and we can carry the job through to new linings, roofing and repairs.</p>''' + COMMON_RULE,
    ["Ipswich Central", "North Ipswich", "Booval", "Bundamba", "Silkstone", "Brassall", "Raceview", "Yamanto", "Leichhardt", "Karalee", "Goodna", "Redbank Plains", "Springfield", "Augustine Heights", "Ripley", "Rosewood"],
    '''<p>Ipswich City Council’s resource recovery centres at <strong>Riverview</strong> and <strong>Rosewood</strong> list asbestos among the materials they <strong>do not accept</strong>. Council’s advice is to engage a licensed professional to safely remove and dispose of asbestos materials.</p>
<p>That means in Ipswich the practical option is usually to have the removalist take the waste to a facility licensed to accept it. We wrap, label and dispose of the waste and keep the documentation with the job record.</p>''',
    [("Ipswich City Council — resource recovery centres", "https://www.ipswich.qld.gov.au/Live/Waste-and-Recycling/Resource-Recovery-Centres"),
     ("WorkSafe Queensland — who can remove asbestos", "https://www.worksafe.qld.gov.au/licensing-and-registrations/asbestos-removal-and-licensing/which-businesses-are-licensed-to-remove-asbestos-in-queensland")],
    [("Can I take asbestos to the Riverview or Rosewood tip?", "<p>No. Ipswich City Council lists asbestos as a material its resource recovery centres do not accept, and advises engaging a licensed professional to remove and dispose of it.</p>"),
     ("Do you work in Springfield and Ripley?", "<p>Yes. We cover the whole City of Ipswich, including the newer estates in Springfield, Augustine Heights and Ripley as well as the older suburbs.</p>"),
     ("We are renovating an old Ipswich house. Where do we start?", "<p>Start by finding out what you have. If the house was built before 1990, assume there may be asbestos and have suspect materials checked before demolition starts. See <a href=\"/guides/does-my-house-have-asbestos/\">does my house have asbestos?</a></p>"),
     ("Can you do the repairs after removal?", "<p>Yes. Alliance can carry the job through to new linings, roofing, carpentry and reinstatement.</p>")],
    "Asbestos Removal Ipswich | Licensed Class A & B | Alliance Group",
    "Licensed asbestos removal in Ipswich, Goodna, Springfield and Rosewood. Fibro, roofs and friable asbestos removed and disposed of properly — then repaired. 0403 126 276.",
)

LOGAN = area_page(
    "asbestos-removal-logan", "Logan", "City of Logan", "containment",
    "Work area sealed with plastic sheeting and marked during asbestos works",
    "Springwood · Browns Plains · Beenleigh · Shailer Park",
    "Licensed Class A and Class B asbestos removal across the City of Logan — Springwood, Slacks Creek, Woodridge, Browns Plains, Beenleigh and the suburbs between.",
    '''<h2>Asbestos removal <span>across Logan.</span></h2>
<p>Logan’s established suburbs — Woodridge, Kingston, Slacks Creek, Springwood and Beenleigh — include many homes built in the decades when asbestos cement sheeting was standard. Rentals, renovations and storm repairs regularly turn up fibro in bathrooms, laundries, eaves and extensions.</p>
<p>We handle the removal, the site controls and the paperwork, and we can complete the repair or reinstatement afterwards so the property is back in use.</p>''' + COMMON_RULE,
    ["Logan Central", "Woodridge", "Kingston", "Slacks Creek", "Springwood", "Daisy Hill", "Shailer Park", "Loganholme", "Beenleigh", "Eagleby", "Marsden", "Crestmead", "Browns Plains", "Regents Park", "Waterford", "Jimboomba"],
    '''<p>Logan City Council lists the <strong>Browns Plains waste and recycling facility</strong> for asbestos. Council’s current rules include:</p>
<ul>
<li>Asbestos is accepted <strong>daily between 8:00am and 3:30pm</strong>.</li>
<li>Residents (living in or outside Logan) can bring loads of <strong>less than 175 kg</strong>; approved transporters can bring any quantity.</li>
<li>The asbestos must be <strong>wetted down and double wrapped in durable PVC plastic</strong> so the load is airtight.</li>
<li>You must <strong>call ahead at least 30 minutes</strong> before you arrive, and staff will not help unload.</li>
</ul>
<p>If the load is larger, broken or friable — or you would rather not handle it at all — a licensed removalist takes care of the wrapping, transport and paperwork.</p>''',
    [("Logan City Council — asbestos disposal", "https://www.logan.qld.gov.au/asbestos-disposal"),
     ("WorkSafe Queensland — who can remove asbestos", "https://www.worksafe.qld.gov.au/licensing-and-registrations/asbestos-removal-and-licensing/which-businesses-are-licensed-to-remove-asbestos-in-queensland")],
    [("Where can I dispose of asbestos in Logan?", "<p>Logan City Council lists the Browns Plains waste and recycling facility. Residents can bring under 175 kg, wetted and double wrapped in durable PVC, and must call at least 30 minutes ahead. Check council’s page before you go.</p>"),
     ("Do you do rental property asbestos jobs in Logan?", "<p>Yes. We work with property managers and landlords across Logan on tenant concerns, suspect material and vacate works. See <a href=\"/property-managers/\">property managers</a>.</p>"),
     ("Do you cover Beenleigh and Jimboomba?", "<p>Yes. We cover the whole City of Logan, from Springwood and Shailer Park to Beenleigh, Eagleby and Jimboomba.</p>"),
     ("Can you make a storm-damaged roof safe?", f"<p>Yes — call <a href=\"tel:{TEL}\">{PHONE}</a>. We make the roof safe, control any broken asbestos and complete the repair. See <a href=\"/emergency-response/\">emergency response</a>.</p>")],
    "Asbestos Removal Logan | Springwood to Beenleigh | Alliance Group",
    "Licensed asbestos removal across Logan — Springwood, Woodridge, Browns Plains, Beenleigh. Council disposal rules, make-safe and repairs. Call 0403 126 276.",
)

REDLANDS = area_page(
    "asbestos-removal-redlands", "Redlands", "Redland City", "site-protection",
    "Floors and fittings protected before works start",
    "Capalaba · Cleveland · Victoria Point · Redland Bay",
    "Licensed Class A and Class B asbestos removal across Redland City — Capalaba, Alexandra Hills, Wellington Point, Cleveland, Victoria Point and Redland Bay.",
    '''<h2>Asbestos removal <span>across the Redlands.</span></h2>
<p>From Capalaba and Alexandra Hills to the bayside suburbs of Wellington Point, Ormiston, Cleveland and Victoria Point, the Redlands has a large stock of homes, beach houses and outbuildings from the era of asbestos cement sheeting. Coastal weather is also hard on old roofs and eaves.</p>
<p>We remove asbestos sheeting, roofs, eaves and damaged material under licence, and complete the repair or new roof afterwards.</p>''' + COMMON_RULE,
    ["Capalaba", "Alexandra Hills", "Birkdale", "Wellington Point", "Ormiston", "Cleveland", "Thornlands", "Victoria Point", "Redland Bay", "Sheldon", "Mount Cotton"],
    '''<p>The national asbestos disposal facility finder lists two Redland City facilities:</p>
<ul>
<li><strong>Birkdale Waste Transfer Station</strong> — residential and commercial asbestos, with a limit of <strong>less than 10 m² or 250 kg</strong>.</li>
<li><strong>Redland Bay Recycling and Waste Centre</strong> — residential asbestos only, with the same <strong>less than 10 m² or 250 kg</strong> limit.</li>
</ul>
<p>Anything bigger than that, or any broken or friable material, is a job for a licensed removalist — who handles the wrapping, transport, disposal and waste paperwork.</p>''',
    [("Asbestos Safety and Eradication Agency — Birkdale Waste Transfer Station", "https://www.asbestossafety.gov.au/node/84"),
     ("Asbestos Safety and Eradication Agency — Redland Bay Recycling and Waste Centre", "https://www.asbestossafety.gov.au/node/291"),
     ("WorkSafe Queensland — who can remove asbestos", "https://www.worksafe.qld.gov.au/licensing-and-registrations/asbestos-removal-and-licensing/which-businesses-are-licensed-to-remove-asbestos-in-queensland")],
    [("Where can I take asbestos in the Redlands?", "<p>The national facility finder lists Birkdale Waste Transfer Station (residential and commercial) and Redland Bay Recycling and Waste Centre (residential), both with a limit of less than 10 m² or 250 kg. Confirm with the facility before you go.</p>"),
     ("Do you cover Cleveland and Victoria Point?", "<p>Yes. We cover the Redland City mainland suburbs from Capalaba and Birkdale through Cleveland, Thornlands, Victoria Point and Redland Bay.</p>"),
     ("Can you replace an old asbestos roof?", "<p>Yes. We remove asbestos cement roofing under licence and install the new roof as part of the same job. See <a href=\"/roofing/\">roofing</a>.</p>"),
     ("How quickly can you quote?", "<p>Send the address and a few photos through the form. Photos usually let us tell you straight away whether an inspection or testing is needed.</p>")],
    "Asbestos Removal Redlands | Capalaba to Redland Bay | Alliance Group",
    "Licensed asbestos removal in the Redlands — Capalaba, Wellington Point, Cleveland, Victoria Point, Redland Bay. Disposal limits, make-safe and repairs. 0403 126 276.",
)

BRISBANE_REGIONS = [
    ("Northside", ["Chermside", "Aspley", "Kedron", "Stafford", "Everton Park", "Mitchelton", "Ferny Grove", "Nundah", "Sandgate", "Bracken Ridge", "Zillmere", "Bald Hills"]),
    ("Southside", ["Annerley", "Moorooka", "Salisbury", "Coopers Plains", "Sunnybank", "Mount Gravatt", "Holland Park", "Acacia Ridge", "Rocklea", "Calamvale"]),
    ("Eastside", ["Camp Hill", "Carina", "Coorparoo", "Morningside", "Cannon Hill", "Bulimba", "Wynnum", "Manly", "Tingalpa", "Wakerley"]),
    ("Westside", ["Toowong", "Indooroopilly", "Kenmore", "Ashgrove", "The Gap", "Oxley", "Inala", "Darra", "Jindalee", "Corinda"]),
]

regions_html = "".join(f'<h3>{r}</h3>{suburbs(s)}' for r, s in BRISBANE_REGIONS)

AREAS_FAQ = [
    ("Do you cover the Gold Coast or Sunshine Coast?", f"<p>Our core area is Brisbane, Moreton Bay, Ipswich, Logan and the Redlands. For jobs further out in South East Queensland, call <a href=\"tel:{TEL}\">{PHONE}</a> and we will tell you straight away whether we can help.</p>"),
    ("Can I take asbestos to a Brisbane City Council tip?", "<p>No. Brisbane City Council says its resource recovery centres do not accept asbestos or materials containing asbestos. Have a licensed removalist handle disposal.</p>"),
    ("Do you charge to come out?", "<p>We explain whether an inspection is needed and confirm any applicable fees before anything is booked. Photos often let us scope the job without a separate visit.</p>"),
]

AREAS = {
    "path": "/service-areas/",
    "title": "Areas We Cover | Asbestos Removal Brisbane & SEQ | Alliance Group",
    "description": "Alliance Group covers Brisbane, Moreton Bay, Ipswich, Logan and the Redlands for asbestos removal, emergency make-safe, roofing and mould remediation.",
    "preload": "sunset-tape",
    "crumbs": [("/", "Home"), ("/service-areas/", "Areas we cover")],
    "faq": AREAS_FAQ,
    "body": page_hero("sunset-tape", "Roofline at dusk behind orange safety barrier tape", [("/", "Home"), ("/service-areas/", "Areas we cover")],
                      "Brisbane · South East Queensland", "Areas we <span>cover.</span>",
                      "Brisbane, Moreton Bay, Ipswich, Logan and the Redlands — asbestos removal, emergency make-safe, roofing, mould remediation and the repair that follows.") + f'''

<section class="sec bone on-light" aria-labelledby="regions-h"><div class="wrap">
<div class="head"><div><div class="mono label">By region</div><h2 id="regions-h">Across <span>South East Queensland.</span></h2></div><p>Choose your area for local disposal rules and the suburbs we cover.</p></div>
{link_cards([
    {"href": "/asbestos-removal-moreton-bay/", "tag": "North", "title": "Moreton Bay", "text": "Strathpine, North Lakes, Redcliffe, Caboolture and surrounds.", "more": "Moreton Bay"},
    {"href": "/asbestos-removal-ipswich/", "tag": "West", "title": "Ipswich", "text": "Ipswich, Goodna, Springfield, Ripley and Rosewood.", "more": "Ipswich"},
    {"href": "/asbestos-removal-logan/", "tag": "South", "title": "Logan", "text": "Springwood, Woodridge, Browns Plains, Beenleigh and surrounds.", "more": "Logan"},
    {"href": "/asbestos-removal-redlands/", "tag": "East", "title": "Redlands", "text": "Capalaba, Wellington Point, Cleveland, Victoria Point and Redland Bay.", "more": "Redlands"},
], "cards four")}
</div></section>

<section class="sec bone2 on-light" aria-labelledby="bris-h"><div class="wrap split">
<aside class="aside"><div class="card"><h3>In Brisbane?</h3><p>Asbestos removal, make-safe and repairs right across the city.</p><a class="btn" href="#quote">Get a quote</a><a class="btn ghost" href="tel:{TEL}">{PHONE}</a></div></aside>
<div class="prose">
<h2 id="bris-h">Brisbane <span>suburbs.</span></h2>
<p>We work right across Brisbane City — older Queenslanders and post-war fibro homes, units, rentals, strata and commercial sites. A few of the suburbs we regularly cover:</p>
{regions_html}
<h3>Asbestos waste in Brisbane</h3>
<p>Brisbane City Council’s resource recovery centres do not accept asbestos or materials containing asbestos. Disposal is handled through licensed contractors — another reason to have the removalist take care of it.</p>
<div class="sources"><h2>Sources</h2><ul><li><a href="https://www.brisbane.qld.gov.au/about-council/your-brisbane/environment-and-sustainability/recycling/how-to-safely-dispose-asbestos-in-brisbane" rel="noopener">Brisbane City Council — how to safely dispose of asbestos</a></li></ul><p class="updated mono">Checked October 2026.</p></div>
</div>
</div></section>

{faq_section(AREAS_FAQ, "Area questions", "Where we work.")}

{quote_section("", "Next step", "Tell us where the property is.")}
''',
}

PAGES = [AREAS, MORETON, IPSWICH, LOGAN, REDLANDS]
