"""Guides: evergreen, sourced answers to the questions customers ask most."""
from build import (PHONE, TEL, UPDATED_TEXT, pic, quote_section, faq_section, era_check, page_hero, link_cards,
                   article_schema, band)

GUIDES = [
    {"href": "/guides/does-my-house-have-asbestos/", "tag": "Guide 01", "title": "Does my house have asbestos?", "text": "Build year, the eight places to look and what to do before anyone drills.", "more": "Read the guide"},
    {"href": "/guides/asbestos-removal-rules-queensland/", "tag": "Guide 02", "title": "Queensland removal rules", "text": "The 10 m² rule, Class A and Class B licences, notifications and clearance.", "more": "Read the guide"},
    {"href": "/guides/asbestos-after-storm-or-flood/", "tag": "Guide 03", "title": "Asbestos after a storm or flood", "text": "What to do when damage breaks fibro or roof sheeting — and what not to do.", "more": "Read the guide"},
    {"href": "/guides/asbestos-removal-cost-brisbane/", "tag": "Guide 04", "title": "What affects the cost", "text": "The eight things that set the price of asbestos removal, and what a good quote includes.", "more": "Read the guide"},
]


def related(exclude):
    return [g for g in GUIDES if g["href"] != exclude][:3]


def guide(path, title, description, h1, kicker, lede, image, alt, toc_items, prose, sources, faq, extra_after=""):
    crumb = [("/", "Home"), ("/guides/", "Guides"), (path, h1.replace("<span>", "").replace("</span>", ""))]
    src = "".join(f'<li><a href="{u}" rel="noopener">{t}</a></li>' for t, u in sources)
    toc = '<ul class="toc">' + "".join(f'<li><a href="#{a}">{t}</a></li>' for a, t in toc_items) + "</ul>"
    body = page_hero(image, alt, crumb, kicker, h1, lede,
                     actions=f'<a class="btn" href="#quote">Ask us about your property</a><a class="btn ghost" href="tel:{TEL}">Call {PHONE}</a>') + f'''

<article class="sec bone on-light" aria-label="{h1.replace('<span>', '').replace('</span>', '')}"><div class="wrap split">
<aside class="aside">
<div class="mono label">In this guide</div>
{toc}
<div class="card"><h3>Not sure what you have?</h3><p>Send a photo and the build year. We will tell you the safe next step.</p><a class="btn" href="#quote">Get advice</a><a class="btn ghost" href="tel:{TEL}">{PHONE}</a></div>
</aside>
<div class="prose">
<p class="updated mono">Alliance Group · Updated {UPDATED_TEXT}</p>
{prose}
<div class="sources"><h2>Sources</h2><ul>{src}</ul></div>
</div>
</div></article>
{extra_after}
{faq_section(faq, "Questions", "Quick answers.")}

<section class="sec" aria-label="More guides"><div class="wrap">
<div class="mono label">Keep reading</div>
{link_cards(related(path))}
</div></section>

{quote_section("Asbestos & Hazmat", "Next step", "Want someone to look at it?", "Send the address, the build year if you know it, and a few photos. We will tell you whether it needs testing, a make-safe or removal.")}
'''
    return {"path": path, "title": title, "description": description, "preload": image, "crumbs": crumb, "faq": faq,
            "og_type": "article", "schema": [article_schema(path, h1.replace("<span>", "").replace("</span>", ""), description, image)], "body": body}


# ------------------------------------------------------------------ 1
HOUSE = guide(
    "/guides/does-my-house-have-asbestos/",
    "Does My House Have Asbestos? Queensland Build-Year Guide | Alliance Group",
    "If your Queensland home was built before 1990 it is likely to contain asbestos. The eight places to look, why you cannot tell by looking, and what to do first.",
    "Does my house have <span>asbestos?</span>",
    "Guide · Queensland homes",
    "The build year tells you how likely it is. Where it is tells you what to watch out for. Here is how to work out whether your home has asbestos — before anyone drills, cuts or sands.",
    "damage-opening", "Opened ceiling showing damage requiring assessment",
    [("year", "Start with the build year"), ("where", "Eight places to look"), ("look", "You cannot tell by looking"), ("do", "What to do"), ("renovate", "Before you renovate")],
    '''<h2 id="year">Start with the <span>build year.</span></h2>
<p>Queensland Government guidance is simple: <strong>if your house was built before 1990, there’s a good chance it contains some asbestos.</strong></p>
<ul>
<li><strong>Before 1990</strong> — likely to contain asbestos materials somewhere in the building.</li>
<li><strong>1990 to 2003</strong> — less likely. Asbestos was banned in building products in 1990, but some homes built in the 1990s and early 2000s still used asbestos products until the total ban came into effect in 2003.</li>
<li><strong>After 2003</strong> — unlikely in the original build. Older sections, extensions or reused materials can still contain it.</li>
</ul>
<p>Renovated homes are the tricky ones. A 1970s house with a 2010 kitchen can still have fibro behind the new tiles, under the vinyl or in the eaves.</p>

<h2 id="where">Eight places <span>to look.</span></h2>
<ol>
<li><strong>Roof sheeting and gutters</strong> — corrugated asbestos cement roofs, capping and old gutters, especially on garages, sheds and carports.</li>
<li><strong>Eaves and soffit sheeting</strong> — flat sheets under the roof overhang.</li>
<li><strong>Wall and ceiling sheets (fibro)</strong> — internal and external walls, enclosed verandahs, extensions and ceilings.</li>
<li><strong>Meter and fuse boxes</strong> — older meter boards were often made with asbestos.</li>
<li><strong>Wet-area splashbacks</strong> — behind tiles in bathrooms, laundries and kitchens.</li>
<li><strong>Vinyl flooring and underlay</strong> — vinyl tiles, sheet vinyl backing and the sheeting under it.</li>
<li><strong>Fences</strong> — flat or corrugated asbestos cement fencing.</li>
<li><strong>Sheds and outbuildings</strong> — walls and roofs of sheds, garages and old laundries.</li>
</ol>

<h2 id="look">You cannot tell <span>by looking.</span></h2>
<p>Asbestos cement sheeting looks like ordinary fibre cement sheeting. As the Queensland guidance puts it, you can’t tell if a material contains asbestos just by looking at it. If you need to know for certain, a sample has to be analysed by an accredited laboratory.</p>
<p>Until you know, treat suspect material as if it contains asbestos.</p>

<h2 id="do">What <span>to do.</span></h2>
<div class="callout"><b>Leave it alone</b><p>Do not cut, drill, sand, scrape, water-blast or break suspect material. Do not sweep, dust or use a household vacuum on broken material — that makes fibres airborne.</p></div>
<ol>
<li><strong>Keep it intact.</strong> Asbestos cement in good condition, left undisturbed, is far lower risk than broken or weathered material.</li>
<li><strong>Take a photo</strong> from a safe distance and note where it is.</li>
<li><strong>Get it checked</strong> before any work that would disturb it — renovation, rewiring, plumbing, re-roofing or demolition.</li>
<li><strong>Tell your trades.</strong> Anyone working on the house needs to know about suspect materials before they start.</li>
</ol>

<h2 id="renovate">Before you <span>renovate.</span></h2>
<p>Most asbestos exposures in homes happen during renovation. Plan for it up front: identify suspect materials, have them tested or treated as asbestos, and have any asbestos removed correctly before the rest of the work starts. In Queensland, more than 10 m² of bonded asbestos must be removed by a licensed removalist — see <a href="/guides/asbestos-removal-rules-queensland/">the removal rules</a>.</p>
<p>Alliance can remove the asbestos and then carry out the repair and reinstatement, so the renovation is not left waiting between contractors.</p>''',
    [("QBCC — asbestos safety", "https://www.qbcc.qld.gov.au/dz/node/1266"),
     ("Queensland Government — asbestos information", "https://www.asbestos.qld.gov.au/"),
     ("WorkSafe Queensland — who can remove asbestos", "https://www.worksafe.qld.gov.au/licensing-and-registrations/asbestos-removal-and-licensing/which-businesses-are-licensed-to-remove-asbestos-in-queensland")],
    [("My house was built in 1985. Does it definitely have asbestos?", "<p>Not definitely, but it is likely to contain some asbestos materials. Have suspect materials checked before any work that would disturb them.</p>"),
     ("Is asbestos dangerous if I leave it alone?", "<p>Bonded asbestos in good condition that is not disturbed is much lower risk. The risk comes when it is broken, weathered, cut, drilled, sanded or water-blasted and fibres are released.</p>"),
     ("How do I get asbestos tested?", "<p>A sample is taken and analysed by an accredited laboratory. Taking a sample disturbs the material, so it should be done carefully. We can tell you whether testing is worth doing before quoting removal.</p>")],
    extra_after=era_check("Asbestos check", "check"),
)

# ------------------------------------------------------------------ 2
RULES = guide(
    "/guides/asbestos-removal-rules-queensland/",
    "Asbestos Removal Rules Queensland: 10 m², Class A & Class B | Alliance Group",
    "Queensland asbestos removal rules in plain English: the 10 m² non-friable limit, Class A vs Class B licences, notifications, clearance and how to check a licence.",
    "Queensland asbestos <span>removal rules.</span>",
    "Guide · Licences &amp; limits",
    "When you can remove asbestos yourself, when you need a licensed removalist, and which licence. Plain English, with the official sources.",
    "containment", "Work area sealed with plastic sheeting and marked during asbestos works",
    [("types", "Friable and non-friable"), ("ten", "The 10 m² rule"), ("classes", "Class A and Class B"), ("notify", "Notifications and clearance"), ("check", "Checking a licence"), ("waste", "Disposal")],
    '''<h2 id="types">Friable and <span>non-friable.</span></h2>
<p>Queensland’s rules turn on what kind of asbestos it is.</p>
<ul>
<li><strong>Non-friable (bonded) asbestos</strong> is bound into another material — most commonly asbestos cement sheeting (“fibro”), roofing and pipes. In good condition it does not crumble by hand.</li>
<li><strong>Friable asbestos</strong> is loose, or can be crumbled, pulverised or reduced to powder by hand pressure when dry. It releases fibres much more easily. Bonded material that is badly damaged — by fire, for example — can become friable.</li>
</ul>

<h2 id="ten">The 10 m² <span>rule.</span></h2>
<p>WorkSafe Queensland: <strong>a licence is not required to remove ten square metres or less of non-friable asbestos.</strong> That is roughly a small bathroom wall or a couple of sheets of eave lining.</p>
<div class="callout"><b>Small does not mean anything goes</b><p>Even under 10 m², the work must still follow Part 8.7 of the Work Health and Safety Regulation 2011, and the waste must be disposed of properly — QBCC warns that hefty fines apply. The 10 m² limit never applies to friable asbestos.</p></div>

<h2 id="classes">Class A <span>and Class B.</span></h2>
<div class="tablewrap"><table class="table">
<thead><tr><th>Licence</th><th>What it covers</th><th>What it does not</th></tr></thead>
<tbody>
<tr><td>Class A</td><td>Any amount of friable asbestos, and more than 10 m² of non-friable asbestos</td><td>—</td></tr>
<tr><td>Class B</td><td>More than 10 m² of non-friable asbestos</td><td>Friable asbestos</td></tr>
<tr><td>No licence</td><td>10 m² or less of non-friable asbestos, following WHS Regulation Part 8.7</td><td>Friable asbestos, or more than 10 m² of non-friable</td></tr>
</tbody></table></div>
<p>Alliance is a Class A and Class B asbestos removal contractor, so one contractor can take friable and bonded work on the same site.</p>

<h2 id="notify">Notifications <span>and clearance.</span></h2>
<p>Before licensed asbestos removal work starts, a notification must be submitted to Workplace Health and Safety Queensland. For urgent removal after a flood or severe storm there is a time-limited exemption — see <a href="/guides/asbestos-after-storm-or-flood/">asbestos after a storm or flood</a>.</p>
<p>When the removal is finished, the area is inspected before it is reoccupied. For friable asbestos, a licensed asbestos assessor carries out air monitoring and the clearance inspection, and issues the clearance certificate. For bonded work, the clearance inspection is carried out by an independent competent person.</p>

<h2 id="check">Checking <span>a licence.</span></h2>
<p>WorkSafe Queensland publishes registers of Class A and Class B licence holders and recommends checking the register to confirm a business holds the licence it claims. It is worth doing for any removalist — including us.</p>

<h2 id="waste">Disposal.</h2>
<p>Asbestos waste has to go to a facility that accepts it, wrapped and handled correctly. Council rules vary a lot across South East Queensland — Brisbane City Council and Ipswich City Council resource recovery centres do not accept asbestos, while Logan and the Redlands have facilities with load limits. See the local details on our <a href="/service-areas/">area pages</a>.</p>''',
    [("WorkSafe Queensland — which businesses are licensed to remove asbestos", "https://www.worksafe.qld.gov.au/licensing-and-registrations/asbestos-removal-and-licensing/which-businesses-are-licensed-to-remove-asbestos-in-queensland"),
     ("QBCC — asbestos safety", "https://www.qbcc.qld.gov.au/dz/node/1266"),
     ("Queensland Government — asbestos workers and removalists", "https://asbestos.qld.gov.au/practical-guidance/asbestos-workers-and-removalists")],
    [("Can I remove asbestos myself in Queensland?", "<p>You can remove 10 m² or less of non-friable (bonded) asbestos without a licence, provided the work follows Part 8.7 of the WHS Regulation 2011 and the waste is disposed of properly. Anything over 10 m², and any friable asbestos, needs a licensed removalist.</p>"),
     ("Which licence do I need for an asbestos roof?", "<p>Asbestos cement roofing is usually non-friable, and most roofs are well over 10 m², so a Class B (or Class A) licence is needed. If the sheeting is badly damaged it may be friable, which needs Class A.</p>"),
     ("Who issues the clearance certificate?", "<p>For friable asbestos removal, a licensed asbestos assessor carries out air monitoring and the clearance inspection and issues the certificate. For bonded work, the clearance inspection is done by an independent competent person.</p>")],
)

# ------------------------------------------------------------------ 3
STORM = guide(
    "/guides/asbestos-after-storm-or-flood/",
    "Asbestos After a Storm or Flood in Queensland: What To Do | Alliance Group",
    "Storm, hail or flood broke fibro or an asbestos roof? What to do first, what not to do, and how Queensland’s urgent-removal exemption works after severe weather.",
    "Asbestos after a <span>storm or flood.</span>",
    "Guide · Emergency",
    "Hail, wind, floodwater and fallen trees break asbestos cement sheeting. Here is what to do first, what to avoid, and how urgent removal works in Queensland.",
    "flooded-home", "Floodwater across the front yard and driveway of a house after heavy rain",
    [("first", "First, stay safe"), ("dont", "What not to do"), ("exemption", "Urgent removal"), ("insurance", "Insurance and later work"), ("help", "How we help")],
    f'''<h2 id="first">First, <span>stay safe.</span></h2>
<p>Storm damage creates several hazards at once — power, structure, water and broken building materials. Deal with the urgent ones first.</p>
<ol>
<li><strong>People first.</strong> If anyone is hurt or there is immediate danger, call 000. Keep clear of fallen power lines.</li>
<li><strong>Keep people and pets away</strong> from broken sheeting and debris that may contain asbestos.</li>
<li><strong>Close it off</strong> if you can do so safely — shut doors and windows to the affected area.</li>
<li><strong>Photograph it</strong> from a safe distance for your records and your insurer.</li>
<li><strong>Call a licensed removalist</strong> to control and remove damaged asbestos — <a href="tel:{TEL}">{PHONE}</a>.</li>
</ol>

<h2 id="dont">What <span>not to do.</span></h2>
<div class="callout"><b>Do not clean it up like ordinary debris</b><p>Do not sweep, vacuum, water-blast, break up or drive over broken asbestos sheeting. Do not throw it in a skip or a general waste bin. These release fibres and spread contamination.</p></div>
<p>The Queensland Government publishes a specific safe-work procedure for storm and wind damage clean-up involving asbestos — follow it, or leave the asbestos part of the clean-up to a licensed removalist.</p>

<h2 id="exemption">Urgent <span>removal.</span></h2>
<p>Normally, licensed asbestos removal must be notified to the regulator in advance. After a flood or severe storm, Queensland has a <strong>class exemption</strong>: where damaged asbestos poses an imminent risk to the community if it is not immediately removed, licensed removalists can remove it urgently without the usual advance notice, and notify the regulator afterwards as soon as practicable.</p>
<ul>
<li>The exemption runs from <strong>16 March 2023 to 15 March 2028</strong>, unless amended or cancelled sooner.</li>
<li>It is <strong>time-limited after each event</strong> — it does not continue indefinitely after the storm or flood.</li>
</ul>

<h2 id="insurance">Insurance and <span>later work.</span></h2>
<p>Removal that happens later — for example months afterwards as part of an insurance claim — does not benefit from the exemption, and normal advance notification applies. Good photos of the damage and the make-safe, taken at the time, make the later claim and the permanent repair simpler.</p>

<h2 id="help">How <span>we help.</span></h2>
<p>Alliance handles the whole sequence: make-safe and temporary weatherproofing, control and removal of damaged asbestos under licence, documentation of the condition and works, and then the roofing and building repair. See <a href="/emergency-response/">emergency response</a>.</p>''',
    [("Queensland Government — cleaning after floods and storms", "https://www.asbestos.qld.gov.au/general-information/cleaning-after-floods-and-storms"),
     ("WorkSafe Queensland — who can remove asbestos", "https://www.worksafe.qld.gov.au/licensing-and-registrations/asbestos-removal-and-licensing/which-businesses-are-licensed-to-remove-asbestos-in-queensland")],
    [("Can I put broken fibro in my skip after a storm?", "<p>No. Asbestos waste must be wrapped and disposed of at a facility that accepts it. Mixing it with general waste spreads contamination and can attract fines.</p>"),
     ("Will my insurer pay for asbestos removal?", "<p>That depends on your policy and insurer. Photos of the damage and a clear record of the make-safe and removal help either way.</p>"),
     ("How fast can damaged asbestos be removed?", f"<p>Where it poses an imminent risk after a flood or severe storm, licensed removalists can remove it urgently under Queensland’s class exemption. Call <a href=\"tel:{TEL}\">{PHONE}</a>.</p>")],
)

# ------------------------------------------------------------------ 4
COST = guide(
    "/guides/asbestos-removal-cost-brisbane/",
    "Asbestos Removal Cost Brisbane: What Sets the Price | Alliance Group",
    "What affects the cost of asbestos removal in Brisbane — material type, quantity, access, containment, clearance, disposal and repairs — and what a good quote includes.",
    "What affects the cost of <span>asbestos removal?</span>",
    "Guide · Pricing",
    "Two jobs that look the same in a photo can be priced very differently. These are the things that actually set the price — and what to look for in a quote.",
    "work-area-protection", "Floors protected with paper and tape before works",
    [("factors", "The eight cost factors"), ("quote", "What a good quote includes"), ("cheap", "Cheap quotes"), ("faster", "Get a faster quote")],
    '''<h2 id="factors">The eight <span>cost factors.</span></h2>
<ol>
<li><strong>Friable or bonded.</strong> Friable asbestos needs a Class A removalist, tighter controls and air monitoring by a licensed assessor. Bonded fibro is simpler.</li>
<li><strong>How much there is.</strong> Area in square metres, number of sheets, and whether it comes off whole or in pieces.</li>
<li><strong>Where it is and how you get to it.</strong> A garden-shed wall is very different from a second-storey eave or a roof that needs edge protection.</li>
<li><strong>Containment.</strong> Indoor work in an occupied home may need sealed work areas, plastic sheeting and protection of the rest of the house.</li>
<li><strong>Notifications and paperwork.</strong> Licensed work is notified before it starts, and records are kept with the job.</li>
<li><strong>Clearance.</strong> An independent clearance inspection — and air monitoring for friable work — before the area is reoccupied.</li>
<li><strong>Disposal.</strong> Waste is wrapped, transported and disposed of at a facility that accepts asbestos. Weight and facility charges matter.</li>
<li><strong>What happens after.</strong> Removal leaves a gap. Relining, a new roof or other reinstatement adds to the job — but done by the same contractor it avoids a second call-out and a delay.</li>
</ol>

<h2 id="quote">What a good <span>quote includes.</span></h2>
<ul>
<li>What material is being removed, where, and roughly how much.</li>
<li>Whether testing or an inspection is needed first.</li>
<li>The controls and containment for the job.</li>
<li>Who does the clearance, and whether it is included.</li>
<li>Disposal and waste documentation.</li>
<li>What is left when the removal crew leaves — and whether reinstatement is included.</li>
</ul>
<p>We explain whether an inspection is needed and confirm applicable fees before anything is booked.</p>

<h2 id="cheap">Cheap <span>quotes.</span></h2>
<p>A low price can mean something has been left out: clearance not included, disposal charged later, no containment for indoor work, or no plan for the hole left behind. Compare quotes on scope, not just the total. And check the licence — WorkSafe Queensland publishes the Class A and Class B registers.</p>

<h2 id="faster">Get a <span>faster quote.</span></h2>
<p>Send these with your enquiry and we can often scope the job from photos:</p>
<ul>
<li>The address or suburb, and the year the building was built if you know it.</li>
<li>Photos of the material up close and from further back, so we can see where it sits.</li>
<li>Rough measurements — wall lengths and heights, or roof dimensions.</li>
<li>Whether the property is occupied, and any access issues.</li>
<li>Whether you also need the repair or reinstatement afterwards.</li>
</ul>''',
    [("WorkSafe Queensland — which businesses are licensed to remove asbestos", "https://www.worksafe.qld.gov.au/licensing-and-registrations/asbestos-removal-and-licensing/which-businesses-are-licensed-to-remove-asbestos-in-queensland"),
     ("Queensland Government — asbestos workers and removalists", "https://asbestos.qld.gov.au/practical-guidance/asbestos-workers-and-removalists")],
    [("Do you charge for a quote?", "<p>We explain whether an inspection is needed and confirm any applicable fees before anything is booked. Many jobs can be scoped from good photos.</p>"),
     ("Is it cheaper to remove asbestos myself?", "<p>Only 10 m² or less of bonded asbestos can be removed without a licence in Queensland, and it still has to be done under the WHS Regulation and disposed of properly. See <a href=\"/guides/asbestos-removal-rules-queensland/\">the rules</a>.</p>"),
     ("Do you publish a price list?", "<p>No, because the price depends on the eight factors above. Send photos and we will give you a clear scope and price.</p>")],
)

INDEX = {
    "path": "/guides/",
    "title": "Asbestos Guides for Queensland Homes & Properties | Alliance Group",
    "description": "Plain-English guides: does your house have asbestos, Queensland removal rules, asbestos after storms and floods, and what sets the cost of removal.",
    "preload": "sunset-tape",
    "crumbs": [("/", "Home"), ("/guides/", "Guides")],
    "body": page_hero("sunset-tape", "Roofline at dusk behind orange safety barrier tape", [("/", "Home"), ("/guides/", "Guides")],
                      "Guides · Queensland asbestos", "Asbestos, <span>plainly answered.</span>",
                      "The questions homeowners, landlords and property managers ask us most — answered in plain English, with the official sources.",
                      actions=f'<a class="btn" href="#quote">Ask about your property</a><a class="btn ghost" href="/blog/">Latest articles</a>') + f'''

<section class="sec bone on-light" aria-label="Guides"><div class="wrap">
{link_cards(GUIDES, "cards four")}
</div></section>

{band("Found something suspect? Do not touch it — send us a photo.")}

{quote_section("Asbestos & Hazmat", "Next step", "Still not sure?")}
''',
}

PAGES = [INDEX, HOUSE, RULES, STORM, COST]
