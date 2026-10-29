#!/usr/bin/env python3
"""Verify the Alliance public site in live-site/ without contacting customers.

Checks every page for the phone number, intake script, a single H1, title,
description and canonical; that every internal link and asset resolves; that
structured data parses; and that the homepage and blog keep their key parts.
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import json
import sys

BASE = Path("live-site")
SITE = "https://www.alliancegroups.com.au"
ROUTES = ("", "emergency-response", "roofing", "asbestos-hazmat", "mould-remediation", "property-managers",
          "compliance-shield", "about", "contact", "intake", "blog", "privacy", "service-areas",
          "asbestos-removal-moreton-bay", "asbestos-removal-ipswich", "asbestos-removal-logan", "asbestos-removal-redlands",
          "guides", "guides/does-my-house-have-asbestos", "guides/asbestos-removal-rules-queensland",
          "guides/asbestos-after-storm-or-flood", "guides/asbestos-removal-cost-brisbane")


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links, self.assets, self.ids = set(), set(), set()
        self.h1 = 0
        self.title = self.desc = self.canonical = None
        self.ld = []
        self._in_title = self._in_ld = False
        self._buf = ""

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            self.ids.add(a["id"])
        if tag == "h1":
            self.h1 += 1
        if tag == "title" and self.title is None:
            self._in_title = True
            self.title = ""
        if tag == "meta" and a.get("name") == "description":
            self.desc = a.get("content")
        if tag == "link" and a.get("rel") == "canonical":
            self.canonical = a.get("href")
        if tag == "script" and a.get("type") == "application/ld+json":
            self._in_ld, self._buf = True, ""
        for key in ("href", "src", "poster"):
            v = a.get(key)
            if v and v.startswith("/") and not v.startswith("//"):
                (self.assets if v.startswith("/assets/") or "." in v.rsplit("/", 1)[-1] else self.links).add(urlsplit(v).path)
        for key in ("srcset", "imagesrcset"):
            for part in (a.get(key) or "").split(","):
                p = part.strip().split(" ")[0]
                if p.startswith("/"):
                    self.assets.add(p)

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        if tag == "script" and self._in_ld:
            self.ld.append(self._buf)
            self._in_ld = False

    def handle_data(self, data):
        if self._in_title:
            self.title += data
        if self._in_ld:
            self._buf += data


def target_for(path):
    p = BASE / path.lstrip("/")
    return p / "index.html" if path.endswith("/") else p


def main():
    errors = []
    titles = {}
    for route in ROUTES:
        path = BASE / route / "index.html"
        if not path.exists():
            errors.append(f"missing page: {path}")
            continue
        html = path.read_text(encoding="utf-8")
        for required in ("<main", "Alliance", "0403126276", "/assets/site.js", 'id="quote"'):
            if required not in html:
                errors.append(f"{path}: required marker missing: {required}")
        if "__CF$cv" in html:
            errors.append(f"{path}: Cloudflare challenge script must not be committed")
        page = Page()
        page.feed(html)
        if page.h1 != 1:
            errors.append(f"{path}: expected one <h1>, found {page.h1}")
        if not page.title or len(page.title) > 85:
            errors.append(f"{path}: title missing or too long ({len(page.title or '')})")
        if not page.desc or not 70 <= len(page.desc) <= 175:
            errors.append(f"{path}: description missing or wrong length ({len(page.desc or '')})")
        expected = f"{SITE}/{route + '/' if route else ''}"
        if page.canonical != expected:
            errors.append(f"{path}: canonical {page.canonical} != {expected}")
        if page.title in titles:
            errors.append(f"{path}: duplicate title with {titles[page.title]}")
        titles[page.title] = path
        for block in page.ld:
            try:
                json.loads(block)
            except ValueError as exc:
                errors.append(f"{path}: structured data does not parse: {exc}")
        for link in page.links:
            if not target_for(link if link.endswith("/") or "." in link.rsplit("/", 1)[-1] else link + "/").exists():
                errors.append(f"{path}: broken internal link {link}")
        for asset in page.assets:
            t = BASE / asset.lstrip("/")
            if not t.is_file() or t.stat().st_size == 0:
                errors.append(f"{path}: missing asset {asset}")
    home = (BASE / "index.html").read_text(encoding="utf-8")
    for marker in ('id="quick-quote"', 'class="faq"', "Asbestos removal Brisbane", 'name="phone"', 'name="message"', "data-era-check"):
        if marker not in home:
            errors.append(f"Homepage conversion element missing: {marker}")
    blog = (BASE / "blog" / "index.html").read_text(encoding="utf-8")
    for marker in ('id="soro-blog"', "https://app.trysoro.com/api/embed/b5fd38b4-b7bf-4377-9428-2014ee8a8f7e"):
        if marker not in blog:
            errors.append(f"Blog page Soro widget missing: {marker}")
    intake = (BASE / "intake" / "index.html").read_text(encoding="utf-8")
    for marker in ('name="files"', 'name="consent"', 'id="project-intake"'):
        if marker not in intake:
            errors.append(f"Intake page element missing: {marker}")
    script = BASE / "assets/site.js"
    if not script.is_file() or "submitLead" not in script.read_text(encoding="utf-8"):
        errors.append("production Firebase intake script not present")
    sitemap = (BASE / "sitemap.xml").read_text(encoding="utf-8")
    for route in ROUTES:
        if f"<loc>{SITE}/{route + '/' if route else ''}</loc>" not in sitemap:
            errors.append(f"sitemap missing /{route}")
    if errors:
        for e in errors:
            print("FAIL:", e, file=sys.stderr)
        raise SystemExit(1)
    print(f"OK: {len(ROUTES)} pages, titles/descriptions/canonicals, links, assets, structured data and intake code")


if __name__ == "__main__":
    main()
