#!/usr/bin/env python3
"""Render every emitted file straight from disk, exactly as a client would."""

import glob
import os

import build as B
from preview import shoot

OUT = B.OUT
cards = []
for path in sorted(glob.glob(os.path.join(OUT, "*.svg"))):
    name = os.path.basename(path)
    svg = open(path).read()
    # Strip the fixed width/height so the card can size it; viewBox drives shape.
    svg = svg.replace('width="', 'data-w="', 1).replace('height="', 'data-h="', 1)
    svg = svg.replace("<svg ", '<svg style="width:100%;height:auto;display:block" ', 1)
    dark = "white" in name
    bg = "#0A2233" if dark else "#FFFFFF"
    small = "appicon" in name or "favicon" in name or "mark" in name
    box = "170px" if small else "100%"
    cards.append(
        f'<div style="border:1px solid #DCE5EA;border-radius:10px;overflow:hidden">'
        f'<div style="background:{bg};padding:22px;display:flex;justify-content:center">'
        f'<div style="width:{box}">{svg}</div></div>'
        f'<div style="padding:9px 12px;font:11px Inter,sans-serif;color:#5d7382;'
        f'border-top:1px solid #EEF3F6">{name}'
        f'<span style="float:right;color:#9ab">{os.path.getsize(path)} B</span></div></div>'
    )

html = ('<!doctype html><meta charset="utf-8">'
        '<body style="margin:0;background:#F6F9FA;padding:26px;font:14px Inter,sans-serif;'
        'display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start">'
        + "".join(cards) + "</body>")
shoot(html, "verify", 1240, 1900)
