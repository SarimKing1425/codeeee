#!/usr/bin/env python3
"""The contest presentation board — the image that gets posted as the entry.

Answers the brief point by point: a typography-led mark, a proposed palette with
its reasoning, proof it is vector-native and scales, and the short note on why
the typeface and colours were chosen.
"""

import os
import subprocess

import build as B
import emit as E

HERE = os.path.dirname(os.path.abspath(__file__))
SCRATCH = "/tmp/claude-0/-home-user-codeeee/d2a4694e-dda0-519b-8622-3c94f4d4cccc/scratchpad"
SHELL = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell"

BG = "#04202F"
INK = "#FFFFFF"
MUTE = "rgba(255,255,255,.58)"
FAINT = "rgba(255,255,255,.34)"
LINE = "rgba(255,255,255,.10)"
PANEL = "rgba(255,255,255,.035)"

W = 1500


def fluid(svg):
    return svg.replace("<svg ", '<svg style="width:100%;height:auto;display:block" ', 1)


def eyebrow(num, text):
    return (
        f'<div style="display:flex;align-items:baseline;gap:14px;'
        f'border-bottom:1px solid {LINE};padding-bottom:13px;margin-bottom:30px">'
        f'<span style="color:{B.CLARITY};font:600 12px Inter;letter-spacing:.16em">'
        f'{num}</span>'
        f'<span style="color:{INK};font:600 12px Inter;letter-spacing:.16em">'
        f'{text}</span></div>'
    )


def section(inner, pad_top=64):
    return f'<section style="padding:{pad_top}px 74px 0">{inner}</section>'


def swatch(name, hexv, role, on_white, on_navy):
    return (
        f'<div style="flex:1">'
        f'<div style="height:104px;border-radius:9px;background:{hexv};'
        f'border:1px solid {LINE}"></div>'
        f'<div style="margin-top:13px;color:{INK};font:600 13px Inter">{name}</div>'
        f'<div style="color:{B.CLARITY};font:500 12px Inter;letter-spacing:.05em;'
        f'margin-top:3px">{hexv.upper()}</div>'
        f'<div style="color:{MUTE};font:400 11.5px/1.55 Inter;margin-top:7px">{role}</div>'
        f'<div style="color:{FAINT};font:400 10.5px/1.5 Inter;margin-top:6px">'
        f'on white {on_white} &nbsp;·&nbsp; on navy {on_navy}</div></div>'
    )


def build():
    hero = fluid(E.wordmark(None, E.FLOW_DARK, "bHero"))
    on_white = fluid(E.wordmark(None, E.FLOW_LIGHT, "bLight"))
    on_navy_solid = fluid(E.wordmark("#FFFFFF", title="bWhite"))
    navy_flat = fluid(E.wordmark(B.ABYSS, title="bNavy"))

    A = B.letter_A()
    m = A["meta"]
    yc = B.DROP_BOTTOM - m["drop_r"]

    big_a = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-14 -20 328 340" '
        f'style="width:100%;height:auto;display:block">'
        f'<defs>{E._grad("bA", 0, 0, 300, 300, E.FLOW_DARK)}</defs>'
        f'<path d="{A["d"]}" fill-rule="evenodd" fill="url(#bA)"/></svg>'
    )
    constr = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-16 -24 470 348" '
        f'style="width:100%;height:auto;display:block">'
        f'<path d="{A["d"]}" fill-rule="evenodd" fill="rgba(255,255,255,.10)"/>'
        f'<path d="{A["d"]}" fill-rule="evenodd" fill="none" '
        f'stroke="rgba(255,255,255,.72)" stroke-width="1.6"/>'
        # the circle that closes the droplet, and the diagonals it is tangent to
        f'<circle cx="150" cy="{B.n(yc)}" r="{B.n(m["drop_r"])}" fill="none" '
        f'stroke="{B.CLARITY}" stroke-width="2" stroke-dasharray="7 6"/>'
        f'<g stroke="rgba(37,209,228,.5)" stroke-width="1.3">'
        f'<line x1="-16" y1="0" x2="330" y2="0"/>'
        f'<line x1="-16" y1="300" x2="330" y2="300"/>'
        f'<line x1="150" y1="-24" x2="150" y2="324" stroke-dasharray="4 7" '
        f'opacity=".55"/></g>'
        # leader from the circle's edge out to its label
        f'<line x1="{B.n(150 + m["drop_r"])}" y1="{B.n(yc)}" x2="330" y2="{B.n(yc)}" '
        f'stroke="{B.CLARITY}" stroke-width="1.3" opacity=".7"/>'
        f'<g fill="{B.CLARITY}" font-family="Inter" font-size="15" font-weight="500">'
        f'<text x="338" y="5">cap</text><text x="338" y="305">base</text>'
        f'<text x="338" y="{B.n(yc + 5)}">one circle</text></g>'
        f'</svg>'
    )

    # Clear space: 25% of cap height on every side.
    cs = B.CAP * 0.25
    csv = (
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="{B.n(-cs-14)} {B.n(E.TOP-cs-14)} {B.n(E.WIDTH+2*cs+28)} '
        f'{B.n(E.HEIGHT+2*cs+28)}" style="width:100%;height:auto;display:block">'
        f'<rect x="{B.n(-cs)}" y="{B.n(E.TOP-cs)}" width="{B.n(E.WIDTH+2*cs)}" '
        f'height="{B.n(E.HEIGHT+2*cs)}" fill="none" stroke="{B.CLARITY}" '
        f'stroke-width="3" stroke-dasharray="12 10" opacity=".75"/>'
        + "".join(
            f'<path d="{d}" fill-rule="{fr}" fill="rgba(255,255,255,.9)"/>'
            for _, d, fr in E.PLACED
        )
        + f'</svg>'
    )

    icons = "".join(
        f'<div style="text-align:center">'
        f'<div style="width:{s}px;height:{s}px;margin:0 auto">'
        f'{fluid(E.appicon(gid=f"bIcon{s}"))}</div>'
        f'<div style="color:{FAINT};font:400 10.5px Inter;margin-top:10px">'
        f'{s}px</div></div>'
        for s in (128, 64, 32, 16)
    )

    small_marks = "".join(
        f'<div style="display:flex;align-items:center;gap:16px">'
        f'<span style="color:{FAINT};font:400 10.5px Inter;width:52px">{s}px</span>'
        f'<div style="width:{s*3.55:.0f}px">'
        f'{fluid(E.wordmark("#FFFFFF", title=f"bS{s}"))}</div></div>'
        for s in (13, 18, 26, 40)
    )

    tab = (
        f'<div style="background:#12202B;border-radius:11px;padding:11px;'
        f'border:1px solid {LINE}">'
        f'<div style="display:flex;align-items:center;gap:9px;background:#1E2E3B;'
        f'border-radius:7px 7px 0 0;padding:9px 13px;width:250px">'
        f'<div style="width:16px;height:16px;flex:none">'
        f'{fluid(E.appicon(gid="bTab"))}</div>'
        f'<span style="color:rgba(255,255,255,.85);font:400 12px Inter;'
        f'white-space:nowrap">Avex — Water Purification</span></div>'
        f'<div style="height:44px;background:#0B1720;border-radius:0 0 7px 7px">'
        f'</div></div>'
    )

    why_type = (
        "<b>Drawn, not typed.</b> Every letter is an original outline built on one "
        "system: a 52-unit stem, horizontals cut to 44 so the bars do not optically "
        "outweigh the stems, and pointed terminals that overshoot the cap and "
        "baseline by 2% so the A and V sit level with the flat-cut E and X. Because "
        "the mark is geometry rather than text, there is no font to licence, no "
        "font to go missing, and nothing to re-outline at the printer."
        "<br><br>"
        "<b>Why a geometric grotesque.</b> Water treatment sells on precision and "
        "trust. Circles and straight lines read as engineered; humanist curves would "
        "read as wellness. All-caps gives a clean rectangular silhouette that locks "
        "into any layout, and the medium weight is heavy enough to survive a favicon "
        "yet open enough to stay elegant on a billboard."
        "<br><br>"
        "<b>The one idea.</b> The A and V are the same shape inverted, so their "
        "facing edges are exactly parallel — the AV pair kerns to a sliver of white "
        "that never varies in width. That discipline earns the single flourish: the "
        "A's counter is a water droplet, formed by the letter's own inner diagonals "
        "closing onto one circle. It is not an icon dropped into a letter; it is the "
        "negative space the A already had."
    )
    why_colour = (
        "<b>A short hue journey, not two colours.</b> The palette travels 207° → 186°, "
        "a narrow analogous sweep. Read left to right the wordmark goes from deep, "
        "mineral-heavy blue to clear aqua — the product's promise performed by the "
        "logo itself. It stays one family, so it never looks like two brands."
        "<br><br>"
        "<b>Why this blue.</b> The default corporate blue sits near 215° and belongs "
        "to banks and software. Pulling the anchor to 207° and the accent to 186° "
        "moves the mark toward cyan-teal — the hue the eye reads as potable and "
        "hygienic rather than swimming-pool. Deep <i>Source</i> carries depth and "
        "engineering; <i>Clarity</i> carries oxygen and cleanliness."
        "<br><br>"
        "<b>Contrast is designed, not hoped for.</b> Clarity measures only 1.86:1 on "
        "white, so it never carries the mark there — on light grounds the ramp runs "
        "Source → Current (4.09:1 at its lightest) and Clarity is held back as an "
        "accent. On navy the ramp inverts to Current → Clarity at 8.38:1. The mark "
        "clears 4:1 on every approved ground, and one-colour navy, black and white "
        "lockups ship for embossing, etching and single-plate print."
    )

    html = f"""<!doctype html><meta charset="utf-8">
<body style="margin:0;background:{BG};width:{W}px;font-family:Inter,sans-serif;
 -webkit-font-smoothing:antialiased">

<div style="padding:56px 74px 0;display:flex;justify-content:space-between;
 align-items:flex-end">
  <div>
    <div style="color:{B.CLARITY};font:600 12px Inter;letter-spacing:.2em">
      AVEX &nbsp;·&nbsp; WATER PURIFICATION</div>
    <div style="color:{INK};font:600 27px Inter;margin-top:12px;letter-spacing:-.015em">
      Modern text logo — wordmark &amp; identity system</div>
  </div>
  <div style="color:{FAINT};font:400 11.5px/1.7 Inter;text-align:right">
    Original vector letterforms<br>No licensed font · No raster</div>
</div>

<section style="padding:76px 74px 78px">
  <div style="width:1150px;margin:0 auto">{hero}</div>
</section>

{section(eyebrow('01', 'THE IDEA') + f'''
  <div style="display:flex;gap:44px;align-items:flex-start">
    <div style="width:250px;flex:none">{big_a}</div>
    <div style="width:358px;flex:none">{constr}</div>
    <div style="color:{MUTE};font:400 14.5px/1.78 Inter;padding-top:6px">
      <span style="color:{INK};font-weight:600">The counter of the A is a water
      droplet.</span> Its two straight flanks are not drawn — they <i>are</i> the
      letter's own inner diagonals, running down from the inner apex until a single
      circle, tangent to both, closes the shape. Change the stroke weight and the
      droplet re-forms correctly on its own, because it is defined by the letter
      rather than placed inside it.
      <br><br>
      That is the whole concept. Everything else is restraint: three equal arms on
      the E reading as filtration strata, and not one shape added that the alphabet
      did not already supply.
    </div>
  </div>''')}

{section(eyebrow('02', 'LOCKUPS') + f'''
  <div style="display:flex;gap:22px">
    <div style="flex:1;background:#FFFFFF;border-radius:11px;padding:46px 40px;
      display:flex;align-items:center">
      <div style="width:100%">{on_white}</div></div>
    <div style="flex:1;background:{B.ABYSS};border-radius:11px;padding:46px 40px;
      display:flex;align-items:center;border:1px solid {LINE}">
      <div style="width:100%">{on_navy_solid}</div></div>
  </div>
  <div style="display:flex;gap:22px;margin-top:22px">
    <div style="flex:1;background:{B.VAPOUR};border-radius:11px;padding:40px;
      display:flex;align-items:center">
      <div style="width:100%">{navy_flat}</div></div>
    <div style="flex:1;background:{PANEL};border:1px solid {LINE};border-radius:11px;
      padding:26px 30px;display:flex;flex-direction:column;justify-content:space-between">
      <div style="width:100%">{csv}</div>
      <div style="color:{MUTE};font:400 12.5px/1.72 Inter;margin-top:22px">
        <b style="color:{INK}">Clear space</b> — 25% of cap height on every side.<br>
        <b style="color:{INK}">Minimum width</b> — 90px on screen; below that the
        droplet closes and the A mark should be used instead.<br>
        <b style="color:{INK}">Ratio</b> — 3.55 : 1, fixed. Never stretched, outlined,
        rotated or shadowed.
      </div>
    </div>
  </div>''')}

{section(eyebrow('03', 'COLOUR — PROPOSED') + f'''
  <div style="display:flex;gap:20px">
    {swatch('Abyss', B.ABYSS, 'One-colour lockup, body copy, dark grounds.', '15.6:1', '—')}
    {swatch('Source', B.SOURCE, 'Gradient origin. Depth, mineral, engineering.', '11.2:1', '—')}
    {swatch('Current', B.CURRENT, 'Flat brand colour. The workhorse.', '4.09:1', '3.80:1')}
    {swatch('Clarity', B.CLARITY, 'Accent + droplet. Dark grounds only.', '1.86:1', '8.38:1')}
    {swatch('Vapour', B.VAPOUR, 'Light ground, surfaces, packaging fields.', '—', '—')}
  </div>''')}

{section(eyebrow('04', 'SCALE — FAVICON TO BILLBOARD') + f'''
  <div style="display:flex;gap:52px;align-items:flex-start;justify-content:space-between">
    <div>
      <div style="display:flex;gap:34px;align-items:flex-end">{icons}</div>
      <div style="color:{MUTE};font:400 12px/1.65 Inter;margin-top:26px;width:330px">
        The droplet survives to 32px and closes gracefully below it — the A stays
        an A. Rendered from the same single path at every size.</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:15px;padding-top:4px">
      {small_marks}
    </div>
    <div style="width:330px">{tab}</div>
  </div>''')}

{section(eyebrow('05', 'WHY — TYPEFACE &amp; COLOUR') + f'''
  <div style="display:flex;gap:48px">
    <div style="flex:1">
      <div style="color:{B.CLARITY};font:600 11.5px Inter;letter-spacing:.14em;
        margin-bottom:15px">TYPEFACE</div>
      <div style="color:{MUTE};font:400 13.5px/1.8 Inter">{why_type}</div>
    </div>
    <div style="flex:1">
      <div style="color:{B.CLARITY};font:600 11.5px Inter;letter-spacing:.14em;
        margin-bottom:15px">COLOUR</div>
      <div style="color:{MUTE};font:400 13.5px/1.8 Inter">{why_colour}</div>
    </div>
  </div>''')}

<div style="padding:66px 74px 58px;margin-top:56px;border-top:1px solid {LINE};
 display:flex;justify-content:space-between;color:{FAINT};font:400 11.5px Inter">
  <span>On award — editable .AI / .EPS source · transparent SVG + PNG at web
    resolutions · high-res PDF mock-ups on light and dark grounds · one-colour lockups</span>
  <span>AVEX</span>
</div>
</body>"""
    return html


def shoot(html, name, height=4200, scale=2):
    """Render tall, then trim the dead background below the footer so the board
    ends exactly where the content does."""
    from PIL import Image

    src = os.path.join(SCRATCH, name + ".html")
    png = os.path.join(B.OUT, name + ".png")
    with open(src, "w") as f:
        f.write(html)
    subprocess.run(
        [SHELL, "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
         f"--force-device-scale-factor={scale}", f"--screenshot={png}",
         f"--window-size={W},{height}", f"file://{src}"],
        check=True, capture_output=True,
    )

    im = Image.open(png).convert("RGB")
    bg = im.getpixel((4, im.height - 4))
    px = im.load()
    last = im.height - 1
    step = max(1, im.width // 240)
    while last > 0:
        row = range(0, im.width, step)
        if any(px[x, last] != bg for x in row):
            break
        last -= 1
    im.crop((0, 0, im.width, min(im.height, last + 40 * scale))).save(png)
    return png, Image.open(png).size


if __name__ == "__main__":
    html = build()
    p, size = shoot(html, "avex-presentation")
    print(f"{p}  {size[0]}x{size[1]}")
    p1, size1 = shoot(html, "avex-presentation@1x", scale=1)
    print(f"{p1}  {size1[0]}x{size1[1]}")
