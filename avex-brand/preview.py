#!/usr/bin/env python3
"""Render a proofing sheet so the letterforms can be judged by eye."""

import os
import subprocess
import sys

import build as B

HERE = os.path.dirname(os.path.abspath(__file__))
SCRATCH = "/tmp/claude-0/-home-user-codeeee/d2a4694e-dda0-519b-8622-3c94f4d4cccc/scratchpad"
SHELL = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell"


def wordmark_svg(fill, pad=40, extra="", fluid=False):
    placed, width, _ = B.build_wordmark()
    top = -B.OVERSHOOT
    h = B.CAP + 2 * B.OVERSHOOT
    paths = "".join(
        f'<path d="{d}" fill-rule="{fr}" fill="{fill}"/>' for _, d, fr in placed
    )
    vb = f"{-pad} {top - pad} {width + 2 * pad} {h + 2 * pad}"
    size = (
        'style="width:100%;height:auto;display:block"' if fluid
        else f'width="{width + 2 * pad}" height="{h + 2 * pad}"'
    )
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" {size}>'
        f'{extra}{paths}</svg>'
    )


def proof_sheet():
    placed, width, _ = B.build_wordmark()
    big = wordmark_svg(B.ABYSS)
    bigf = wordmark_svg(B.ABYSS, fluid=True)
    inv = wordmark_svg("#FFFFFF")

    # Construction view: baseline / cap line / mid line + the raw outlines.
    guides = (
        f'<g stroke="#25D1E4" stroke-width="1.2" opacity=".55">'
        f'<line x1="-30" y1="0" x2="{width+30}" y2="0"/>'
        f'<line x1="-30" y1="{B.CAP}" x2="{width+30}" y2="{B.CAP}"/>'
        f'<line x1="-30" y1="{B.CAP/2}" x2="{width+30}" y2="{B.CAP/2}" '
        f'stroke-dasharray="6 8" opacity=".35"/></g>'
    )
    outline_paths = "".join(
        f'<path d="{d}" fill-rule="{fr}" fill="none" stroke="#06263C" '
        f'stroke-width="1.6"/>' for _, d, fr in placed
    )
    vb = f"-40 {-B.OVERSHOOT-40} {width+80} {B.CAP+2*B.OVERSHOOT+80}"
    outline = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" '
        f'width="{width+80}" height="{B.CAP+2*B.OVERSHOOT+80}">'
        f'{guides}{outline_paths}</svg>'
    )

    sizes = "".join(
        f'<div style="display:flex;align-items:center;gap:14px">'
        f'<span style="width:52px;color:#8aa;font:11px monospace">{s}px</span>'
        f'<div style="width:{s*3.52:.0f}px">{bigf}</div></div>'
        for s in (14, 20, 28, 44, 72)
    )

    html = f"""<!doctype html><meta charset="utf-8">
<body style="margin:0;background:#F4F7F9;font:14px system-ui">
<div style="padding:28px 32px;background:#fff">
  <div style="color:#8aa;font:11px monospace;margin-bottom:10px">PRIMARY / LIGHT</div>
  <div style="width:1100px">{big}</div>
</div>
<div style="padding:28px 32px;background:#06263C">
  <div style="color:#5a8;font:11px monospace;margin-bottom:10px">REVERSED / DARK</div>
  <div style="width:1100px">{inv}</div>
</div>
<div style="padding:28px 32px;background:#fff">
  <div style="color:#8aa;font:11px monospace;margin-bottom:10px">CONSTRUCTION</div>
  <div style="width:1100px">{outline}</div>
</div>
<div style="padding:28px 32px;background:#fff;display:flex;flex-direction:column;gap:14px">
  <div style="color:#8aa;font:11px monospace">SCALE TEST (cap height in px)</div>
  {sizes}
</div>
</body>"""
    return html


def shoot(html, name, w, h):
    src = os.path.join(SCRATCH, name + ".html")
    png = os.path.join(SCRATCH, name + ".png")
    with open(src, "w") as f:
        f.write(html)
    subprocess.run(
        [SHELL, "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
         "--force-device-scale-factor=2", f"--screenshot={png}",
         f"--window-size={w},{h}", f"file://{src}"],
        check=True, capture_output=True,
    )
    print(png)


if __name__ == "__main__":
    shoot(proof_sheet(), sys.argv[1] if len(sys.argv) > 1 else "proof", 1180, 1180)
