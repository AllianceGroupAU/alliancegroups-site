"""Generate colour-only variants of the Alliance live-site stylesheet.

Every rule, size, layout, font and image stays exactly as it is. Only colour
literals inside declaration blocks are rewritten, plus (for the light option)
an appended block that re-colours the content sections.

Usage: python3 docs/colour-options/build.py            -> writes docs/colour-options/themes/*.css
       add --preview to also copy live-site/ into build/<theme>/ for local screenshots (not committed)
"""
import math, re, shutil, sys, pathlib

W = pathlib.Path(__file__).parent
SITE = W.resolve().parents[1] / "live-site"
BASE = (SITE / "assets/site.css").read_text(encoding="utf-8")

# ---------- OKLCH helpers ----------
def _lin(c): c /= 255; return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
def _gam(c): c = max(0.0, min(1.0, c)); return 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055
def hex2oklch(h):
    r, g, b = (_lin(int(h[i:i + 2], 16)) for i in (0, 2, 4))
    l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
    l, m, s = (x ** (1 / 3) for x in (l, m, s))
    L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s
    a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s
    bb = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
    return L, math.hypot(a, bb), math.degrees(math.atan2(bb, a)) % 360
def oklch2hex(L, C, H):
    a, b = C * math.cos(math.radians(H)), C * math.sin(math.radians(H))
    l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
    m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
    s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3
    r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    return "".join(f"{round(_gam(x) * 255):02x}" for x in (r, g, bl))

# ---------- colour roles shared by every option ----------
KEEP = {"38b27b", "10281f", "b9f2d6", "d7f8e9",          # success state
        "391811", "4a221b", "ed936d", "ffe3d2",          # error state
        "ffffff", "111111", "afa69d", "1e1b18"}          # white inputs on the hero quote form
ACCENT, ACCENT2, GLOW, TINT = {"ed713c", "f5b928"}, {"d8a184", "55aee8"}, {"7b3524"}, {"3a2118"}

def neutralise(h, dark_hue, dark_c, light_hue, light_c, dark_lift=0.0):
    L, C, H = hex2oklch(h)
    if L < 0.6:
        return oklch2hex(max(0.0, L + dark_lift * (1 - L / 0.6)), dark_c, dark_hue)
    return oklch2hex(L, light_c, light_hue)

def make_mapper(t):
    def f(h):
        if h in KEEP: return h
        if h in ACCENT: return t["accent"]
        if h in ACCENT2: return t["accent2"]
        if h in GLOW: return t["glow"]
        if h in TINT: return t["tint"]
        return t["neutral"](h)
    return f

def warm_only(h):
    """Ivory option frame: keep the obsidian/copper frame, but pull the stray blue-grey leftovers into the warm family."""
    L, C, H = hex2oklch(h)
    if 170 < H < 290 and C > 0.006:
        return oklch2hex(L, min(C, 0.018), 50)
    return h

THEMES = {
    "current": None,
    "graphite": dict(
        label="Graphite & Copper", accent="ed713c", accent2="d8a184", glow="7b3524", tint="3a2118",
        neutral=lambda h: neutralise(h, 255, 0.009, 85, 0.007, dark_lift=0.11)),
    "hivis": dict(
        label="Black & Hi-Vis", accent="ffc21a", accent2="f1dc8f", glow="5e4a0e", tint="3a3115",
        neutral=lambda h: neutralise(h, 95, 0.0025, 95, 0.004, dark_lift=-0.01)),
    "ivory": dict(
        label="Ivory & Copper", accent="ed713c", accent2="d8a184", glow="7b3524", tint="3a2118",
        neutral=warm_only),
}

HEX = re.compile(r"#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![0-9a-zA-Z_-])")
def recolour(css, mapper):
    def body(m):
        def one(x):
            v = x.group(1).lower()
            if len(v) == 3: v, alpha = "".join(c * 2 for c in v), ""
            else: v, alpha = v[:6], v[6:]
            return "#" + mapper(v) + alpha
        return "{" + HEX.sub(one, m.group(1)) + "}"
    return re.sub(r"\{([^{}]*)\}", body, css)

LIGHT_SCOPE = "main>section:not(.hero):not(.hero-upgrade):not(.page-hero):not(.control-section):not(.band):not(.alliance-faq)"
IVORY_LIGHT = (W / "ivory-light.css").read_text(encoding="utf-8").replace("@L", LIGHT_SCOPE)

def build():
    (W / "themes").mkdir(exist_ok=True)
    for name, t in THEMES.items():
        css = BASE if t is None else recolour(BASE, make_mapper(t))
        if t is not None:
            # Colour bug on the live site: on /intake/ the header button text is accent-on-accent, so it disappears.
            css += "\n/* Colour fix: keep the header button label readable on its own page */\n.links a.nav-cta[aria-current=page]{color:#111}\n"
        if name == "ivory":
            css += "\n" + IVORY_LIGHT
        if name != "current": (W / "themes" / f"{name}.css").write_text(css, encoding="utf-8")
        if "--preview" not in sys.argv: print(name, len(css)); continue
        out = W / "build" / name
        if out.exists(): shutil.rmtree(out)
        shutil.copytree(SITE, out)
        (out / "assets/site.css").write_text(css, encoding="utf-8")
        print(name, len(css))

if __name__ == "__main__":
    build()
