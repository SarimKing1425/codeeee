#!/usr/bin/env python3
"""Rasterise the lockups to transparent PNGs at web resolutions."""

import os
import subprocess

import build as B
import emit as E

SCRATCH = "/tmp/claude-0/-home-user-codeeee/d2a4694e-dda0-519b-8622-3c94f4d4cccc/scratchpad"
SHELL = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell"
PNGDIR = os.path.join(B.OUT, "png")
os.makedirs(PNGDIR, exist_ok=True)

RATIO = E.WIDTH / E.HEIGHT


def render(svg, w, h, out):
    src = os.path.join(SCRATCH, "_exp.html")
    with open(src, "w") as f:
        f.write(
            "<!doctype html><meta charset='utf-8'>"
            "<body style='margin:0;background:transparent'>"
            f"<div style='width:{w}px;height:{h}px'>"
            + svg.replace("<svg ", "<svg style='width:100%;height:100%;display:block' ", 1)
            + "</div></body>"
        )
    subprocess.run(
        [SHELL, "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
         "--default-background-color=00000000", f"--screenshot={out}",
         f"--window-size={w},{h}", f"file://{src}"],
        check=True, capture_output=True,
    )


JOBS = []
for w in (512, 1024, 2048):
    h = round(w / RATIO)
    JOBS += [
        (E.wordmark(None, E.FLOW_LIGHT, f"pL{w}"), w, h, f"avex-logo-gradient-{w}w.png"),
        (E.wordmark(B.ABYSS, title=f"pN{w}"), w, h, f"avex-logo-navy-{w}w.png"),
        (E.wordmark("#FFFFFF", title=f"pW{w}"), w, h, f"avex-logo-white-{w}w.png"),
    ]
for s in (16, 32, 64, 128, 256, 512, 1024):
    JOBS.append((E.appicon(gid=f"pIcon{s}"), s, s, f"avex-appicon-{s}.png"))
for s in (256, 512, 1024):
    JOBS.append((E.mark(B.ABYSS if s != 512 else B.ABYSS), s, round(s * E.HEIGHT / B.W_A),
                 f"avex-mark-navy-{s}w.png"))
    break  # one representative size for the standalone A

if __name__ == "__main__":
    from PIL import Image

    for svg, w, h, name in JOBS:
        out = os.path.join(PNGDIR, name)
        render(svg, w, h, out)
        im = Image.open(out)
        alpha = im.getchannel("A") if im.mode == "RGBA" else None
        tr = "transparent" if alpha and alpha.getextrema()[0] == 0 else "OPAQUE"
        print(f"  {name:34s} {im.size[0]:>5}x{im.size[1]:<5} {tr}")
