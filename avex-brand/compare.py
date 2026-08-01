#!/usr/bin/env python3
"""A/B tool for exploring alternatives.

Mutates build.py's module-level parameters in place, so run it on its own —
it is a design aid, not part of the build.
"""

import build as B
from preview import shoot

CARDS = []
for drop in (194.0, 204.0, 214.0):
    for gap in (64.0, 74.0):
        B.DROP_BOTTOM = drop
        B.GAP_AV = gap
        placed, width, glyphs = B.build_wordmark()
        h = B.CAP + 2 * B.OVERSHOOT
        paths = "".join(
            f'<path d="{d}" fill-rule="{fr}" fill="{B.ABYSS}"/>' for _, d, fr in placed
        )
        svg = (
            f'<svg xmlns="http://www.w3.org/2000/svg" '
            f'viewBox="-10 {-B.OVERSHOOT-10} {width+20} {h+20}" '
            f'style="width:100%;height:auto;display:block">{paths}</svg>'
        )
        r = glyphs["A"]["meta"]["drop_r"]
        notch = B.CAP - (drop + B.BAR)
        CARDS.append(
            f'<div style="padding:16px 20px;border:1px solid #E1E9ED;border-radius:8px">'
            f'<div style="color:#7d94a3;font:11px ui-monospace,monospace;'
            f'margin-bottom:12px">crossbar {drop:.0f} · droplet r{r:.1f} · '
            f'notch {notch:.0f} · AV gap {gap:.0f}</div>'
            f'<div style="width:520px">{svg}</div></div>'
        )

html = ('<!doctype html><meta charset="utf-8">'
        '<body style="margin:0;background:#fff;font:14px system-ui;padding:24px;'
        'display:grid;grid-template-columns:1fr 1fr;gap:18px">' + "".join(CARDS) + '</body>')
shoot(html, "compare", 1180, 900)
