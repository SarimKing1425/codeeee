# AVEX — modern text logo

Contest entry for **Avex**, water purification products.

The mark is a typography-led wordmark. Every letter is drawn from scratch as
vector outlines — there is no `<text>` element, no font reference and no raster
anywhere in the output, so the files render identically on any machine and scale
losslessly from a 16px favicon to a billboard.

**Post `dist/avex-presentation.png` as the entry.** It carries the mark, the
proposed palette, the scale proof and the rationale note the brief asked for.

---

## The short note (paste this with the entry)

**Typeface.** The wordmark isn't set in a font — every letter is an original
outline built on one system: a 52-unit stem, horizontals cut to 44 so the bars
don't optically outweigh the stems, and pointed terminals on the A and V that
overshoot the cap and baseline by 2% so they sit level with the flat-cut E and X.
A geometric grotesque, because water treatment sells on precision: circles and
straight lines read as engineered, where humanist curves would read as wellness.
All-caps keeps the silhouette a clean rectangle that locks into any layout, and
the medium weight is heavy enough to survive a favicon yet open enough to stay
elegant at billboard scale.

The A and V are the same shape inverted, so their facing edges are exactly
parallel — that pair kerns to a sliver of white that never varies in width. That
restraint earns the one flourish: **the A's counter is a water droplet**, formed
by the letter's own inner diagonals closing onto a single tangent circle. It
isn't an icon dropped into a letter; it's the negative space the A already had.
Change the stroke weight and the droplet re-forms correctly on its own.

**Colour.** A short analogous sweep, 207° → 186°: deep mineral blue clarifying
into aqua, so the mark *performs* the product's promise left to right rather
than describing it. It stays one hue family, so it never reads as two brands. I
pulled the anchor off the default corporate 215° blue toward cyan-teal — the hue
the eye reads as potable and hygienic rather than swimming-pool.

Contrast is designed, not hoped for. Clarity `#25D1E4` measures only 1.86:1 on
white, so it never carries the mark there: on light grounds the ramp runs
Source → Current (4.09:1 at its lightest), and on navy it inverts to
Current → Clarity at 8.38:1. The mark clears 4:1 on every approved ground, and
one-colour navy, black and white lockups ship alongside for embossing, etching
and single-plate print.

---

## Palette

| Name | Hex | Role | On white | On navy |
|---|---|---|---|---|
| Abyss | `#06263C` | One-colour lockup, body copy, dark grounds | 15.55:1 | — |
| Source | `#0A3D66` | Gradient origin. Depth, mineral, engineering | 11.22:1 | — |
| Current | `#1087B2` | Flat brand colour. The workhorse | 4.09:1 | 3.80:1 |
| Clarity | `#25D1E4` | Accent + droplet. Dark grounds only | 1.86:1 | 8.38:1 |
| Vapour | `#EBF6F9` | Light ground, surfaces, packaging fields | — | — |

Ratios are WCAG 2.1 and computed in `emit.py` — run it to re-verify.

## Specification

| | |
|---|---|
| Cap height | 300 units (the mark is all-caps, so this is the full height) |
| Stem | 52 (17.3% of cap height) |
| Horizontals | 44 — cut 15% lighter than stems as an optical correction |
| Overshoot | 6 (2%) on the pointed terminals of A and V |
| A / V diagonal | 26.11° from vertical (shared, which is what makes AV kern evenly) |
| X diagonal | 35.75° from vertical |
| Droplet | circle of r = 28.09, tangent to the A's inner diagonals |
| Lockup ratio | 3.55 : 1, fixed |
| Clear space | 25% of cap height on every side |
| Minimum width | 90px on screen; below that use the A mark |

## Files

`dist/` — the deliverables.

**Wordmark (SVG, transparent, tight bounding box)**
- `avex-logo-gradient.svg` — primary, for light grounds (Source → Current)
- `avex-logo-gradient-dark.svg` — primary, for dark grounds (Current → Clarity)
- `avex-logo-navy.svg` · `avex-logo-cyan.svg` · `avex-logo-white.svg` ·
  `avex-logo-black.svg` — one-colour lockups

**The A mark** — `avex-mark-gradient.svg`, `-navy`, `-white`

**Icons** — `avex-appicon.svg`, `avex-appicon-navy.svg`, `avex-favicon.svg`

**Raster** — `dist/png/` — wordmarks at 512/1024/2048px wide and app icons at
16 → 1024px, all with true alpha.

**Board** — `avex-presentation.png` (3000×6341) and `@1x` (1500×3175).

Every logo SVG is under 1.3 KB.

### Still to produce on award

The brief also asks for an editable `.AI` or `.EPS` source and high-resolution
PDF mock-ups on light and dark grounds. Those are not in this repository — the
geometry here is the single source of truth for them, and the SVGs open directly
in Illustrator as fully editable paths to be saved out in those formats.

## Rebuilding

```
python3 emit.py     # logo SVGs + contrast report
python3 export.py   # transparent PNGs
python3 board.py    # the presentation board
python3 preview.py  # proofing sheet
python3 preview2.py # scale test + droplet construction detail
```

`build.py` holds the type system — change `STEM`, `CAP`, `DROP_BOTTOM` or the
letter widths and every file regenerates consistently. Rendering uses the
Chromium bundled at `/opt/pw-browsers`; the board additionally needs Inter
installed for its annotation text (the logo files themselves need nothing).
