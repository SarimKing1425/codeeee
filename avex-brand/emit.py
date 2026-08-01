#!/usr/bin/env python3
"""Emit the AVEX deliverables: wordmark lockups, the A mark, and the app icon.

Everything written here is pure <path> geometry — no <text>, no font references,
no embedded raster. The files open identically in Illustrator, Figma, Inkscape,
Safari or a 16px favicon slot.
"""

import os

import build as B

OUT = B.OUT
os.makedirs(OUT, exist_ok=True)

PLACED, WIDTH, GLYPHS = B.build_wordmark()
TOP = -B.OVERSHOOT
HEIGHT = B.CAP + 2 * B.OVERSHOOT

HEAD = (
    "<!-- AVEX — water purification. Wordmark drawn as outlines; no font "
    "dependency. Scales losslessly from favicon to billboard. -->"
)


def _grad(gid, x1, y1, x2, y2, stops):
    s = "".join(
        f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops
    )
    return (
        f'<linearGradient id="{gid}" gradientUnits="userSpaceOnUse" '
        f'x1="{B.n(x1)}" y1="{B.n(y1)}" x2="{B.n(x2)}" y2="{B.n(y2)}">'
        f"{s}</linearGradient>"
    )


# The ramp is split by ground, so the mark never drops below 4:1 against the
# surface it sits on. On white the bright aqua would fall to 1.9:1, so it is
# held back as an accent and only carries the gradient on dark grounds.
FLOW_LIGHT = [("0", B.SOURCE), ("1", B.CURRENT)]    # deep -> mid, for white
FLOW_DARK = [("0", B.CURRENT), ("1", B.CLARITY)]    # mid  -> bright, for navy
FLOW_TILE = [("0", B.SOURCE), ("0.55", B.CURRENT), ("1", B.CLARITY)]

# Ids are namespaced per file so several AVEX SVGs can be inlined on one page
# without their <defs> colliding.
_ids = set()


def _uid(stem):
    assert stem not in _ids, f"duplicate gradient id {stem}"
    _ids.add(stem)
    return stem


def wordmark(fill, stops=None, gid=None, title="AVEX"):
    defs = ""
    if stops:
        g = _uid(gid)
        defs = f"<defs>{_grad(g, 0, 0, WIDTH, 0, stops)}</defs>"
        fill = f"url(#{g})"
    paths = "".join(
        f'<path d="{d}" fill-rule="{fr}" fill="{fill}"/>' for _, d, fr in PLACED
    )
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="0 {B.n(TOP)} {B.n(WIDTH)} {B.n(HEIGHT)}" '
        f'width="{B.n(WIDTH)}" height="{B.n(HEIGHT)}" role="img" '
        f'aria-labelledby="{title}-t">{HEAD}'
        f'<title id="{title}-t">{title}</title>{defs}{paths}</svg>'
    )


def mark(fill, stops=None, gid=None):
    """The A on its own — for the app icon, favicon and social avatar."""
    A = B.letter_A()
    defs = ""
    if stops:
        g = _uid(gid)
        defs = f"<defs>{_grad(g, 0, 0, B.W_A, B.CAP, stops)}</defs>"
        fill = f"url(#{g})"
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="0 {B.n(TOP)} {B.n(B.W_A)} {B.n(HEIGHT)}" '
        f'width="{B.n(B.W_A)}" height="{B.n(HEIGHT)}" role="img" '
        f'aria-labelledby="{gid or fill}-t">{HEAD}'
        f'<title id="{gid or fill}-t">AVEX</title>{defs}'
        f'<path d="{A["d"]}" fill-rule="evenodd" fill="{fill}"/></svg>'
    )


def appicon(size=512, cap_frac=0.54, radius_frac=0.2237, flat=None, gid="tile"):
    """Rounded tile with the A reversed out of it. The droplet counter lets the
    tile colour through, so the mark still tells its story at 32px."""
    A = B.letter_A()
    scale = size * cap_frac / B.CAP
    gw, gh = B.W_A * scale, HEIGHT * scale
    tx = (size - gw) / 2.0
    ty = (size - gh) / 2.0 - TOP * scale
    r = size * radius_frac
    if flat:
        tile, defs = flat, ""
    else:
        g = _uid(gid)
        tile = f"url(#{g})"
        defs = f"<defs>{_grad(g, 0, 0, size, size, FLOW_TILE)}</defs>"
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" '
        f'width="{size}" height="{size}" role="img" aria-labelledby="{gid}-t">'
        f'{HEAD}<title id="{gid}-t">AVEX</title>{defs}'
        f'<rect width="{size}" height="{size}" rx="{B.n(r)}" ry="{B.n(r)}" '
        f'fill="{tile}"/>'
        f'<g transform="translate({B.n(tx)} {B.n(ty)}) scale({B.n(scale)})">'
        f'<path d="{A["d"]}" fill-rule="evenodd" fill="#FFFFFF"/></g></svg>'
    )


# ----------------------------------------------------------------------------
# Contrast — verify, don't assert
# ----------------------------------------------------------------------------

def _lum(hexstr):
    c = [int(hexstr[i:i + 2], 16) / 255.0 for i in (1, 3, 5)]
    c = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def contrast(a, b):
    la, lb = _lum(a), _lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


FILES = {
    "avex-logo-gradient.svg": wordmark(None, FLOW_LIGHT, "avexFlowLight"),
    "avex-logo-gradient-dark.svg": wordmark(None, FLOW_DARK, "avexFlowDark",
                                            title="AVEX-dark"),
    "avex-logo-navy.svg": wordmark(B.ABYSS),
    "avex-logo-cyan.svg": wordmark(B.CURRENT, title="AVEX-cyan"),
    "avex-logo-white.svg": wordmark("#FFFFFF", title="AVEX-white"),
    "avex-logo-black.svg": wordmark("#000000", title="AVEX-black"),
    "avex-mark-gradient.svg": mark(None, FLOW_LIGHT, "avexMarkFlow"),
    "avex-mark-navy.svg": mark(B.ABYSS),
    "avex-mark-white.svg": mark("#FFFFFF"),
    "avex-appicon.svg": appicon(gid="avexTile"),
    "avex-appicon-navy.svg": appicon(flat=B.ABYSS, gid="avexTileNavy"),
    "avex-favicon.svg": appicon(size=64, cap_frac=0.60, radius_frac=0.16,
                                gid="avexTileFav"),
}

CHECKS = [
    ("Abyss  on white", B.ABYSS, "#FFFFFF"),
    ("Source on white", B.SOURCE, "#FFFFFF"),
    ("Current on white", B.CURRENT, "#FFFFFF"),
    ("Clarity on white", B.CLARITY, "#FFFFFF"),
    ("White  on Abyss", "#FFFFFF", B.ABYSS),
    ("Clarity on Abyss", B.CLARITY, B.ABYSS),
    ("Current on Abyss", B.CURRENT, B.ABYSS),
    ("Abyss  on Vapour", B.ABYSS, B.VAPOUR),
]

if __name__ == "__main__":
    for name, svg in FILES.items():
        with open(os.path.join(OUT, name), "w") as f:
            f.write(svg + "\n")
        print(f"{len(svg):7d}  {name}")
    print(f"\nwordmark {WIDTH:.2f} x {HEIGHT:.2f}  (ratio {WIDTH/B.CAP:.3f}:1)")
    print("\ncontrast ratios")
    for label, fg, bg in CHECKS:
        r = contrast(fg, bg)
        flag = "AAA" if r >= 7 else "AA " if r >= 4.5 else "AA-large" if r >= 3 else "LOW"
        print(f"  {label:18s} {r:6.2f}:1  {flag}")

