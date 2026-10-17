#!/usr/bin/env python3
"""One-time export of PUBLIC live Alliance site into Git-owned, bot-editable files.
No credential harvesting, form submissions, DNS changes, or writes to Cloudflare.
"""
from __future__ import annotations
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit
from urllib.request import urlopen, Request
from urllib.error import HTTPError
import re

BASE = "https://alliancegroups.com.au"
OUT = Path("live-site")
PAGES = ["/", "/emergency-response/", "/roofing/", "/asbestos-hazmat/",
         "/mould-remediation/", "/compliance-shield/", "/about/", "/contact/", "/intake/"]
KNOWN_ASSETS = [
 "/assets/analytics.js", "/assets/site.css", "/assets/site.js",
 "/assets/media/alliance-logo-copper.png",
 "/assets/media/ceiling-repair.jpeg",
 "/assets/media/completed-room.jpeg",
 "/assets/media/damage-opening.jpeg",
 "/assets/media/drying-equipment.webp",
 "/assets/media/emergency-home.webp",
 "/assets/media/moisture-damage.webp",
 "/assets/media/plaster-reinstatement.jpeg",
 "/assets/media/real-site-removal.mp4",
 "/assets/media/reinstatement-framing.jpeg",
 "/assets/media/roof-asbestos-guide.mp4",
 "/assets/media/site-protection.jpeg",
 "/assets/media/strip-out.webp",
 "/assets/media/wall-reinstatement.jpeg",
 "/assets/media/water-damage-guide.mp4",
 "/assets/media/work-area-protection.jpeg",
]
class AssetParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = set()
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in ("src", "href", "poster") and value:
                self.references.add(value)
            if key == "srcset" and value:
                self.references.update(s.strip().split(" ")[0] for s in value.split(",") if s.strip())

def fetch(path):
    req = Request(BASE + path, headers={"User-Agent": "Mozilla/5.0 AllianceGroupSourceExport/1.0"})
    with urlopen(req, timeout=40) as response:
        return response.read(), response.headers.get_content_type()

def destination(path):
    clean = urlsplit(path).path
    name = clean.lstrip("/") + ("index.html" if clean.endswith("/") else "")
    name = name or "index.html"
    result = OUT / name
    if not result.resolve().is_relative_to(OUT.resolve()):
        raise ValueError("Unsafe path " + path)
    return result

def save(path, contents):
    target = destination(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(contents)
    print(f"saved {path} ({len(contents)} bytes)")

def local_asset(url):
    u = urlsplit(urljoin(BASE + "/", url))
    if u.netloc.lower() != "alliancegroups.com.au":
        return None
    return u.path if u.path.startswith("/assets/") else None

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    assets = set(KNOWN_ASSETS)
    for path in PAGES:
        data, typ = fetch(path)
        if typ != "text/html" or len(data) < 2200 or b"<main" not in data or b"Alliance" not in data:
            raise RuntimeError(f"Unexpected HTML at {path}: {typ}, {len(data)} bytes")
        html = data.decode("utf-8", "replace")
        html = re.sub(r'<script>\(function\(\)\{function c\(\)\{var b=a\.contentDocument.*?</script>', "", html, flags=re.DOTALL)
        found = AssetParser()
        found.feed(html)
        assets.update(a for a in (local_asset(u) for u in found.references) if a)
        save(path, html.encode("utf-8"))
    for path in ("/sitemap.xml", "/robots.txt"):
        try:
            data, _ = fetch(path)
            if len(data) > 20:
                save(path, data)
        except HTTPError as exc:
            print(f"optional {path}: HTTP {exc.code}")
    visited = set()
    while assets:
        path = sorted(assets).pop(0)
        assets.remove(path)
        if path in visited:
            continue
        visited.add(path)
        try:
            data, _ = fetch(path)
        except HTTPError as exc:
            raise RuntimeError(f"Required live asset unavailable: {path} HTTP {exc.code}") from exc
        if len(data) < 10:
            raise RuntimeError("Empty asset " + path)
        save(path, data)
        if path.endswith(".css"):
            raw = data.decode("utf-8", "replace")
            references = re.findall(r'url\(\s*["\x27]?([^)"\x27]+)', raw)
            for item in references:
                found = local_asset(urljoin(BASE + path, item.strip()))
                if found and found not in visited:
                    assets.add(found)
    js = (OUT / "assets/site.js").read_bytes()
    if b"submitLead" not in js:
        raise RuntimeError("Live Firebase submitLead code not found; refusing incomplete copy.")
    if b"class=\"hero" not in (OUT / "index.html").read_bytes():
        raise RuntimeError("Expected Alliance hero missing.")
    print(f"COMPLETE: {len(PAGES)} pages and {len(visited)} assets captured; no user data copied.")

if __name__ == "__main__":
    main()
