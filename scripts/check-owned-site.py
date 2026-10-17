#!/usr/bin/env python3
"""Verify exported Alliance public pages and assets without contacting customers."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import sys

BASE = Path("live-site")
ROUTES = ("", "emergency-response", "roofing", "asbestos-hazmat",
          "mould-remediation", "compliance-shield", "about", "contact", "intake")

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
