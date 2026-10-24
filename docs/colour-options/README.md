# Colour options for the Git-owned live site

Three colour-only versions of `live-site/assets/site.css`. Layout, wording, photos, forms and the copper logo are unchanged.

| Option | File | Look |
|---|---|---|
| Current | `live-site/assets/site.css` | Obsidian brown-black, copper accent, with a few leftover blue-grey panels from the first ChatGPT build |
| 1 · Graphite & Copper | `themes/graphite.css` | Charcoal-grey steel instead of brown-black. Same copper as the logo |
| 2 · Black & Hi-Vis | `themes/hivis.css` | Near-black with hi-vis safety yellow for buttons, headings and bands. The logo stays copper |
| 3 · Ivory & Copper | `themes/ivory.css` | Dark header, banners, orange bands and footer. Content sections are warm ivory with white cards |

All three also fix one existing colour bug: on `/intake/` the header "Start an enquiry" button text was the same colour as the button.

## How the options are made

`build.py` rewrites only the colour values inside declaration blocks (OKLCH lightness is kept, so contrast stays the same). Option 3 also appends `ivory-light.css`, which re-colours the content sections while photo tiles keep their dark overlays.

```bash
python3 docs/colour-options/build.py            # regenerate themes/*.css
python3 docs/colour-options/build.py --preview  # also build local preview copies in build/
```

## Applying the chosen option

1. Copy `themes/<option>.css` over `live-site/assets/site.css`.
2. Bump the `?v=` cache key on the `site.css` link in every `live-site/**/index.html`.
3. Update `<meta name="theme-color">` to the option's page colour (graphite `#181b1f`, hi-vis `#080706`, ivory `#0b0807`).
4. Run `python3 scripts/check-owned-site.py` and open a PR. Merging does not publish the public site (see AGENTS.md and issue #49).
