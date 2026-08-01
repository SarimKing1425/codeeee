#!/usr/bin/env python3
"""
AVEX — wordmark construction.

Every letter is drawn from scratch as a vector outline. There is no font
dependency anywhere in the output: the shapes are pure <path> geometry, so the
mark renders identically on any machine and scales from a 16px favicon to a
billboard without a single raster pixel.

Coordinate system
-----------------
  y increases downward (SVG convention)
  cap line ....... y = 0
  baseline ....... y = CAP
  pointed apex/vertex of A, V overshoot the cap/baseline by OVERSHOOT so they
  optically align with the flat-cut terminals of E and X.
"""

import math
import os

# ----------------------------------------------------------------------------
# Type system
# ----------------------------------------------------------------------------

CAP = 300.0        # cap height — the mark is all-caps, so this is the full height
STEM = 52.0        # vertical / diagonal stroke weight (17.3% of cap height)
BAR = 44.0         # horizontal stroke weight — optically corrected, 15% lighter
OVERSHOOT = 6.0    # 2% of cap height; pointed terminals overshoot to sit level

W_A = 300.0        # A width
W_V = 300.0        # V width — identical to A so their adjacent edges stay parallel
W_E = 214.0        # E width
W_X = 268.0        # X width

E_MID = 148.0      # centre of E's middle arm — 2 units above true centre (optical)
DROP_BOTTOM = 204.0  # y of the lowest point of the droplet counter inside the A

# Optical gaps between adjacent letters, measured at their closest approach.
GAP_AV = 74.0
GAP_VE = 28.0
GAP_EX = 34.0

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dist")

# ----------------------------------------------------------------------------
# Palette
# ----------------------------------------------------------------------------

ABYSS = "#06263C"    # near-black navy   — one-colour lockup on light grounds
SOURCE = "#0A3D66"   # deep blue         — gradient origin
CURRENT = "#1087B2"  # mid cyan-blue     — flat brand colour
CLARITY = "#25D1E4"  # bright aqua       — gradient terminus / accent
VAPOUR = "#EBF6F9"   # near-white tint   — light ground


def n(v):
    """Trim a float to 3dp and strip trailing zeros, so path data stays terse."""
    s = f"{v:.3f}".rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


def pt(x, y):
    return f"{n(x)} {n(y)}"


# ----------------------------------------------------------------------------
# Letterforms
# ----------------------------------------------------------------------------

def letter_A():
    """
    A — pointed apex, splayed legs, and a counter that resolves into a water
    droplet. The droplet's straight flanks are *exactly* the letter's own inner
    diagonals (tangent to the arc that closes it), so the droplet is not an icon
    dropped inside a letter: it is the letter's negative space, read twice.
    """
    half = W_A / 2.0
    k = half / (CAP + OVERSHOOT)          # dx/dy of the outer diagonals
    ang = math.atan(k)                    # angle from vertical
    sin_a, cos_a = math.sin(ang), math.cos(ang)

    apex_x = half
    # Outer edges, as x(y) = c + m*y
    ol_c, ol_m = apex_x + k * OVERSHOOT, -k        # outer left
    or_c, or_m = apex_x - k * OVERSHOOT, k         # outer right
    il_c, il_m = ol_c + STEM, -k                   # inner left
    ir_c, ir_m = or_c - STEM, k                    # inner right

    # Inner apex: where the two inner diagonals cross — the top of the counter.
    y_in = (il_c - ir_c) / (ir_m - il_m)
    x_in = il_c + il_m * y_in
    assert abs(x_in - apex_x) < 1e-6

    # Droplet: a circle of radius r whose two tangent lines from the inner apex
    # ARE the inner diagonals.  sin(ang) = r / (yc - y_in), and yc + r = bottom.
    r = (DROP_BOTTOM - y_in) / (1.0 + 1.0 / sin_a)
    yc = DROP_BOTTOM - r
    assert abs(r / (yc - y_in) - sin_a) < 1e-9

    # Tangency points sit perpendicular to the diagonals from the circle centre.
    tx, ty = apex_x + r * cos_a, yc - r * sin_a

    cb_top = DROP_BOTTOM                  # crossbar reads as BAR thick at centre
    cb_bot = cb_top + BAR

    silhouette = (
        f"M{pt(apex_x, -OVERSHOOT)}"
        f"L{pt(or_c + or_m * CAP, CAP)}"
        f"L{pt(ir_c + ir_m * CAP, CAP)}"
        f"L{pt(ir_c + ir_m * cb_bot, cb_bot)}"
        f"L{pt(il_c + il_m * cb_bot, cb_bot)}"
        f"L{pt(il_c + il_m * CAP, CAP)}"
        f"L{pt(ol_c + ol_m * CAP, CAP)}Z"
    )
    droplet = (
        f"M{pt(apex_x, y_in)}"
        f"L{pt(tx, ty)}"
        f"A{n(r)} {n(r)} 0 1 1 {pt(2 * apex_x - tx, ty)}Z"
    )
    return {
        "d": silhouette + droplet,
        "fill_rule": "evenodd",
        "width": W_A,
        # x(y) of the right outer edge — used to space the A against the V
        "right_edge": (or_c, or_m),
        "meta": {"angle_deg": math.degrees(ang), "drop_r": r, "drop_top": y_in},
    }


def letter_V():
    """V — the A's diagonals inverted. Same width and therefore the same angle,
    which makes the A/V pair kern to a perfectly constant sliver of white."""
    half = W_V / 2.0
    k = half / (CAP + OVERSHOOT)
    # Outer left runs (0,0) -> (half, CAP+OVERSHOOT); outer right mirrors it.
    ol_c, ol_m = 0.0, k
    or_c, or_m = W_V, -k
    il_c, il_m = STEM, k
    ir_c, ir_m = W_V - STEM, -k

    y_in = (ir_c - il_c) / (il_m - ir_m)   # inner vertex
    x_in = il_c + il_m * y_in

    d = (
        f"M{pt(0, 0)}"
        f"L{pt(STEM, 0)}"
        f"L{pt(x_in, y_in)}"
        f"L{pt(W_V - STEM, 0)}"
        f"L{pt(W_V, 0)}"
        f"L{pt(half, CAP + OVERSHOOT)}Z"
    )
    return {
        "d": d,
        "fill_rule": "nonzero",
        "width": W_V,
        "left_edge": (ol_c, ol_m),
        "right_edge": (or_c, or_m),
        "meta": {"angle_deg": math.degrees(math.atan(k))},
    }


def letter_E():
    """E — one stem, three arms of equal length. The three equal strata are the
    only other place the brand story surfaces: three stages of filtration."""
    top = BAR
    mid_t, mid_b = E_MID - BAR / 2.0, E_MID + BAR / 2.0
    bot = CAP - BAR
    d = (
        f"M{pt(0, 0)}L{pt(W_E, 0)}L{pt(W_E, top)}L{pt(STEM, top)}"
        f"L{pt(STEM, mid_t)}L{pt(W_E, mid_t)}L{pt(W_E, mid_b)}L{pt(STEM, mid_b)}"
        f"L{pt(STEM, bot)}L{pt(W_E, bot)}L{pt(W_E, CAP)}L{pt(0, CAP)}Z"
    )
    return {"d": d, "fill_rule": "nonzero", "width": W_E, "meta": {}}


def letter_X():
    """X — two crossing strokes resolved into a single 12-point union outline,
    so the shape stays one closed contour at any fill rule or stroke conversion."""
    run = W_X - STEM                      # horizontal travel of each diagonal
    k = run / CAP
    # "\" left edge x = k*y ; "\" right edge x = STEM + k*y
    # "/" left edge x = run - k*y ; "/" right edge x = W_X - k*y
    y_top = (run - STEM) / (2 * k)        # top notch
    x_top = STEM + k * y_top
    y_bot = W_X / (2 * k)                 # bottom notch
    x_bot = k * y_bot
    y_side = CAP / 2.0                    # left + right notches, at true centre
    x_left = k * y_side
    x_right = STEM + k * y_side

    d = (
        f"M{pt(0, 0)}L{pt(STEM, 0)}L{pt(x_top, y_top)}L{pt(run, 0)}L{pt(W_X, 0)}"
        f"L{pt(x_right, y_side)}L{pt(W_X, CAP)}L{pt(run, CAP)}"
        f"L{pt(x_bot, y_bot)}L{pt(STEM, CAP)}L{pt(0, CAP)}L{pt(x_left, y_side)}Z"
    )
    return {
        "d": d,
        "fill_rule": "nonzero",
        "width": W_X,
        "meta": {"angle_deg": math.degrees(math.atan(k))},
    }


# ----------------------------------------------------------------------------
# Wordmark assembly
# ----------------------------------------------------------------------------

def translate(d, dx):
    """Shift a path's absolute coordinates. Handles M/L/A commands only."""
    out, i = [], 0
    tokens = d.replace(",", " ").replace("M", " M ").replace("L", " L ") \
              .replace("A", " A ").replace("Z", " Z ").split()
    while i < len(tokens):
        c = tokens[i]
        if c in ("M", "L"):
            x, y = float(tokens[i + 1]), float(tokens[i + 2])
            out.append(f"{c}{pt(x + dx, y)}")
            i += 3
        elif c == "A":
            rx, ry, rot, laf, sf = tokens[i + 1:i + 6]
            x, y = float(tokens[i + 6]), float(tokens[i + 7])
            out.append(f"A{rx} {ry} {rot} {laf} {sf} {pt(x + dx, y)}")
            i += 8
        elif c == "Z":
            out.append("Z")
            i += 1
        else:
            raise ValueError(f"unexpected path token {c!r}")
    return "".join(out)


def build_wordmark():
    """Place A V E X on a single baseline and return positioned paths + bbox."""
    A, V, E, X = letter_A(), letter_V(), letter_E(), letter_X()

    x_a = 0.0

    # A -> V. Their adjacent edges share one slope, so the gap between them is
    # the same at every height. Solve once, at any y.
    a_c, a_m = A["right_edge"]
    v_c, v_m = V["left_edge"]
    assert abs(a_m - v_m) < 1e-9, "A and V must share a diagonal to kern evenly"
    x_v = x_a + (a_c + GAP_AV) - v_c

    # V -> E. The V's right edge leans away from the E, so the closest approach
    # is at the cap line.
    x_e = x_v + (V["right_edge"][0] + V["right_edge"][1] * 0.0) + GAP_VE

    # E -> X. The X's left tip is flush at the cap line; that is the tight spot.
    x_x = x_e + W_E + GAP_EX

    placed = [
        ("A", translate(A["d"], x_a), A["fill_rule"]),
        ("V", translate(V["d"], x_v), V["fill_rule"]),
        ("E", translate(E["d"], x_e), E["fill_rule"]),
        ("X", translate(X["d"], x_x), X["fill_rule"]),
    ]
    width = x_x + W_X
    return placed, width, {"A": A, "V": V, "E": E, "X": X}


if __name__ == "__main__":
    placed, width, glyphs = build_wordmark()
    print(f"wordmark width : {width:.2f}  (cap {CAP:.0f}, ratio {width/CAP:.3f})")
    for k, g in glyphs.items():
        print(f"  {k}: w={g['width']:.1f} {g['meta']}")
