#!/usr/bin/env python3
"""Verify exported Alliance public pages and assets without contacting customers."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import sys

BASE = Path("live-site")
ROUTES = ("", "emergency-response", "roofing", "asbestos-hazmat",
          "mould-remediation", "compliance-shield", "about", "contact", "intake", "blog")

class AssetRefs(HTMLParser):
    def __init__(self):
        super().__init__()
        self.assets = set()
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if value and key in ("src", "poster", "href") and value.startswith("/assets/"):
                self.assets.add(urlsplit(value).path)

def main():
    errors = []
    refs = AssetRefs()
    for route in ROUTES:
        path = BASE / route / "index.html"
        if not path.exists():
            errors.append(f"missing page: {path}")
            continue
        html = path.read_text(encoding="utf-8")
        for required in ("<main", "Alliance", "0403126276", "/assets/site.js"):
            if required not in html:
                errors.append(f"{path}: required marker missing: {required}")
        if "__CF$cv" in html:
            errors.append(f"{path}: Cloudflare challenge script must not be committed")
        refs.feed(html)
    for asset in refs.assets:
        target = BASE / asset.lstrip("/")
        if not target.is_file() or target.stat().st_size == 0:
            errors.append(f"missing asset: {target}")
    homepage = (BASE / "index.html").read_text(encoding="utf-8")
    for marker in ('id="quick-quote"', 'class="alliance-faq"', 'Asbestos Removal Brisbane', 'name="phone"', 'name="message"'):
        if marker not in homepage:
            errors.append(f"Homepage conversion element missing: {marker}")
    blog = (BASE / "blog" / "index.html").read_text(encoding="utf-8")
    for marker in ('id="soro-blog"', 'https://app.trysoro.com/api/embed/b5fd38b4-b7bf-4377-9428-2014ee8a8f7e'):
        if marker not in blog:
            errors.append(f"Blog page Soro widget missing: {marker}")
    script = BASE / "assets/site.js"
    if not script.is_file() or "submitLead" not in script.read_text(encoding="utf-8"):
        errors.append("production Firebase intake script not present")
    if errors:
        for e in errors:
            print("FAIL:", e, file=sys.stderr)
        raise SystemExit(1)
    print(f"OK: {len(ROUTES)} pages, {len(refs.assets)} referenced assets and Firebase intake code")

if __name__ == "__main__":
    main()
