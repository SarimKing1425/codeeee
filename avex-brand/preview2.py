#!/usr/bin/env python3
"""Small-size + detail proofing — the favicon-to-billboard test."""

import build as B
from preview import wordmark_svg, shoot

placed, width, glyphs = B.build_wordmark()
ratio = width / B.CAP

rows = "".join(
    f'<div style="display:flex;align-items:center;gap:18px;padding:7px 0">'
    f'<span style="width:78px;color:#7d94a3;font:11px ui-monospace,monospace">'
    f'cap {s}px</span>'
    f'<div style="width:{s*ratio:.1f}px;line-height:0">{wordmark_svg(B.ABYSS, pad=0, fluid=True)}</div>'
    f'</div>'
    for s in (10, 12, 14, 16, 20, 24, 32, 48)
)

# Isolated A, drawn large, to judge the droplet.
A = B.letter_A()
big_a = (
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -26 340 352" '
    f'width="340" height="352"><path d="{A["d"]}" fill-rule="evenodd" '
    f'fill="{B.ABYSS}"/></svg>'
)
a_grid = (
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -26 340 352" '
    f'width="340" height="352">'
    f'<path d="{A["d"]}" fill-rule="evenodd" fill="#DCE8EE"/>'
    f'<path d="{A["d"]}" fill-rule="evenodd" fill="none" stroke="{B.ABYSS}" '
    f'stroke-width="1.4"/>'
    f'<g stroke="#25D1E4" stroke-width="1.2" fill="none">'
    f'<circle cx="150" cy="{A["meta"]["drop_r"]*0+B.DROP_BOTTOM-A["meta"]["drop_r"]}" '
    f'r="{A["meta"]["drop_r"]}" stroke-dasharray="5 5"/>'
    f'<line x1="-20" y1="0" x2="320" y2="0" opacity=".5"/>'
    f'<line x1="-20" y1="300" x2="320" y2="300" opacity=".5"/></g></svg>'
)

html = f"""<!doctype html><meta charset="utf-8">
<body style="margin:0;background:#fff;font:14px system-ui;padding:26px 30px">
  <div style="color:#7d94a3;font:11px ui-monospace,monospace;letter-spacing:.08em">
    SCALE TEST — RENDERED AT TRUE PIXEL SIZE</div>
  <div style="margin:14px 0 30px">{rows}</div>
  <div style="color:#7d94a3;font:11px ui-monospace,monospace;letter-spacing:.08em">
    THE A — DROPLET COUNTER + TANGENT CIRCLE</div>
  <div style="display:flex;gap:26px;margin-top:12px">{big_a}{a_grid}</div>
</body>"""

shoot(html, "proof_small", 860, 900)
print(f"ratio {ratio:.3f}  r={A['meta']['drop_r']:.2f}  angle={A['meta']['angle_deg']:.2f}")
