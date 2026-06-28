# CLAUDE.md

## Instagram carousels / case studies (Loxes AI)

If the user mentions **Instagram carousels, IG posts, case studies, or "the carousel
stuff"**, that work lives in **`design-system/`**.

**Read `design-system/README.md` first** (the START HERE index), then
`design-system/INSTAGRAM-DESIGN-SYSTEM.md` in full. Those two files contain everything:
the ink + paper visual system, the non-negotiable voice/copy rules, the picture rules, and
the repeatable client case-study format. Treat them as the source of truth and continue
exactly where previous sessions left off.

Quick facts so you don't drift:
- Strict **ink + paper** (white/black). No colour except real photos inside a grey frame.
- Copy is conversational: **no em/en dashes**, **no "not X, but Y"**, no AI filler.
- For a client case study, **clone `design-system/leshawn-superbowl-casestudy.html`** and
  follow §7.9. Always credit the client ("we helped them build and deploy").
- Output is one **self-contained HTML** per deck with images **embedded as base64**, sized
  1080×1350.

(The rest of this repo is a separate Next.js app; the carousel system is independent of it.)
