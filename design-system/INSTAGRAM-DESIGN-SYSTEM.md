# Asterisk-Style Editorial Carousel — Design System

> **Purpose.** This document lets *any* Claude session reproduce the Instagram
> static posts & carousels in this exact aesthetic, **strictly as a self-contained
> HTML file, with NO MCP and NO external tooling**. Hand a session this file plus
> the copy, and it should output 5–6 finished, beautiful slides ready to screenshot
> at 1080×1350.
>
> **The look in one line:** big high-contrast *italic serif* focal word + heavy
> grotesque uppercase statement, set on a warm paper-grey background, with a single
> graphic mark in the middle. Editorial, analog, confident.
>
> **Reference template:** `design-system/carousel-template.html` (open in a browser,
> each `.slide` is exactly one post). Everything described here is already wired up
> there — this `.md` explains the *why* and the *rules* so a session can extend it.

---

## 0. The single most important rule: COLOR

The reference images (the "stop / start" slides) were **orange + black**.
**We do NOT use orange.** Our brand is **black + warm paper-white**, taken from the
*CLIENT TESTIMONIAL* reference (image 5). Everything that was orange becomes **ink black**.
Hierarchy is then carried by **typeface + size + italic**, never by hue.

```
--paper      #E9E7E1   /* warm light-grey "newsprint" background (from img 5)   */
--paper-2    #EFEDE8   /* slightly lighter paper, for variety between slides     */
--ink        #0E0E0E   /* near-black for ALL primary type & marks (from img 5)   */
--ink-soft   #2A2A2A   /* optional: secondary lines / captions                   */
--ink-mute   #6B6862   /* optional: tiny meta text, footers, page dots           */
--hairline   rgba(14,14,14,0.14) /* grid lines, dividers, nav-chip strokes        */
```

- **Never introduce a third color.** No orange, no blue, no gradient fills.
- **One exception: real photographs keep their own color**, but only *inside a gray
  film/print frame* (see §6.95). The type, marks, and layout around them stay strictly
  ink + paper. A framed photo is the only place color is allowed on a slide.
- The ONLY two ink weights that should ever read as "color" are `--ink` (everything)
  and, rarely, `--ink-mute` for legal-sized meta text.
- Paper is *warm grey*, **not** pure white. Pure `#FFFFFF` looks digital and breaks
  the analog feel. If a client insists on pure white, use `#FAFAF8`, never `#FFFFFF`.

---

## 1. Canvas & format

| Property        | Value                                              |
|-----------------|----------------------------------------------------|
| Aspect ratio    | **4:5 portrait** (Instagram's tallest feed format) |
| Export size     | **1080 × 1350 px**                                  |
| Working unit    | The template uses `px` at 1080×1350; scale with one `--scale` var for preview |
| Safe margins    | **88px** left/right, **96px** top/bottom           |
| Single posts    | Same canvas, just one slide                        |
| Square option   | 1080×1080 — only if asked; reduce vertical gaps    |

Bleed: backgrounds (paper + texture) go **edge to edge**. Type & marks stay inside
the safe margin. Nothing important within 64px of any edge except the footer row.

---

## 2. Typography

Two typefaces do all the work. The tension between them *is* the brand.

### 2.1 Focal word — high-contrast italic serif
The flowing word ("stop", "start", "clarity") is a **bold/black italic display serif**
with strong thick/thin contrast and a calligraphic ductus.

- **Use:** `"Playfair Display"` — Google Fonts, weight **900**, `font-style: italic`.
- Premium equivalents (if the brand licenses them): *Canela Italic*, *Ogg Italic*,
  *GT Sectra Display Italic*. Playfair 900 italic is the free stand-in and matches well.
- Always **lowercase** for the focal word (`stop`, `start`), `letter-spacing: -0.01em`.
- This word is the hero. It is the **largest** element on its half of the slide and it
  **overlaps / kerns tight** against the grotesque line beneath it (see §4).

### 2.2 Statement — heavy grotesque, UPPERCASE
The blocky lines ("REINVENTING EVERY POST.") are a **black-weight grotesque**, set
**UPPERCASE**, very tight leading, tight tracking.

- **Use:** `"Archivo Black"` (Google Fonts, single weight 900) — closest free match.
- Even heavier/condensed premium equivalents: *Druk Wide/Druk*, *Founders Grotesk Bold*,
  *Helvetica Now Display Black*, *Neue Haas Grotesk Black*. If the brand has Druk, use it.
- **UPPERCASE always.** `letter-spacing: -0.02em`, `line-height: 0.92`.
- End the statement with a **period.** — it's part of the voice ("EVERY POST.").

### 2.3 Caption / body — clean grotesque, regular
Small supporting copy (CTA sub-line, testimonial body).

- **Use:** `"Archivo"` regular/medium, or system `"Helvetica Neue", Arial`.
- `line-height: 1.35`, sentence case, `--ink` or `--ink-soft`.

### 2.4 Meta / footer — small italic serif
The tiny "save for later", handle, page count. *We ignore the reference's actual
watermarks* but keep the **style slot**: `Playfair Display` italic, ~22px, `--ink-mute`.

### Type scale (at 1080×1350)
```
Focal serif (hero)     ~150–190px   Playfair Display 900 italic
Statement grotesque    ~92–116px    Archivo Black,    line-height .92
Sub-statement          ~64–80px     Archivo Black (when 3+ lines, shrink to fit)
Section label (title)  ~120–150px   Archivo Black (e.g. "CLIENT TESTIMONIAL")
Caption / body         ~30–36px     Archivo / Helvetica, lh 1.35
Footer meta            ~22–26px     Playfair italic, --ink-mute
```
**Fit rule:** the statement must never wrap awkwardly or overflow the safe area.
If copy is long, step the size DOWN (not the margins in). Keep 2–3 lines max per block.

---

## 3. Layout system

### 3.1 The signature "STOP / START" slide (the workhorse)
Three horizontal zones inside the safe area:

```
┌───────────────────────────────┐  ← paper + texture, full bleed
│  stop                          │  zone A (upper third, LEFT aligned)
│  REINVENTING                   │      • focal serif word
│  EVERY POST.                   │      • heavy grotesque statement (2 lines)
│                                │
│             ✱                  │  zone B (vertical center) — ONE graphic mark
│                                │
│                  start         │  zone C (lower third)
│         USING PROVEN           │      • focal serif word (can shift RIGHT)
│         FRAMEWORKS.            │      • heavy grotesque statement
│                                │
│  meta        ✦save         →   │  footer row (baseline, full width)
└───────────────────────────────┘
```

Rules that make it look "designed", not "typed":
- **Diagonal balance.** If the top block is left-aligned, nudge the bottom block
  **right** (and vice-versa) so the eye travels diagonally through the center mark.
  Vary which corner leads from slide to slide so a carousel feels hand-set.
- **Overlap the serif into the grotesque.** The italic word sits with a negative
  bottom margin so its descenders kiss/overlap the cap-line below (`margin-bottom: -0.12em`).
- The **focal word** and the **statement share a left edge** (or right edge) — they read
  as one locked unit.
- **Center mark** is optically centered vertically and horizontally; it's small
  (~96–130px), pure `--ink`, lots of breathing room around it.

### 3.2 The CTA slide (image 4)
- Background flips to **ink** (`--ink`), type to **paper**.
- A single **photo** (skylight/clouds, or any brand image) sits in the upper area,
  framed tight, slightly small — like a taped-in print.
- Headline: serif italic line ("Comment the word") + **giant focal serif in a different
  optical size** for the keyword in quotes (`"clarity"`), centered.
- One small graphic mark (e.g. a flower/asterisk) floats above the photo.
- Body caption centered beneath, `--paper` at reduced opacity (~0.8).
- Page dots bottom-center.
- **Color note:** even on the dark CTA we use only ink/paper — no orange.

### 3.3 The TITLE / TESTIMONIAL slide (image 5)
- Plain `--paper` (or `--paper-2`), **no texture or very faint**.
- One huge grotesque label, UPPERCASE, 2 lines, left-aligned, optically centered block
  ("CLIENT / TESTIMONIAL").
- Optional tiny "taped card" / pin motif top-right (kept subtle, monochrome).
- This is the cover/intro or section divider of a carousel.

### 3.4 Footer row (every slide except full-bleed CTA, optional)
Three slots on one baseline inside the safe margin:
`handle (left) · save-for-later (center) · forward-arrow → (right)`.
**We don't reproduce the reference's literal @handle/"save for later" text** — these are
*slots*. Fill with the client's own handle, or leave the row off entirely. Keep it
`--ink-mute`, tiny, never competing with the headline.

### 3.5 Side nav chevrons
The faint `‹ ›` circles on the reference are an optional **swipe affordance**. They're
decorative, `--hairline` stroke, vertically centered. **Off by default**; enable with a
body flag if the client likes them. They are *not* Instagram UI we must keep.

---

## 4. The graphic marks (center icons)

Each workhorse slide gets **exactly one** small mark, dead center, in solid `--ink`.
They are simple, iconic, slightly "rubber-stamp". Rotate through a set so a carousel
feels varied. All are pure CSS/SVG (no images needed):

| Mark            | Where seen      | Build note                                  |
|-----------------|-----------------|---------------------------------------------|
| Spiral          | img 1           | SVG path, ~6 turns, round cap, stroke 14px  |
| 8-point star ✸  | img 2           | SVG polygon / `★` glyph, sharp spikes       |
| Eye             | img 3           | SVG: lens ellipse + filled pupil            |
| Asterisk ✱      | brand mark      | heavy `✳`/SVG, the namesake                 |
| Flower ✿        | img 4 (CTA)     | 5 petals, used on dark slides               |
| Burst / sparkle | variety         | 4-point sparkle                             |

Keep them **monochrome ink**, ~96–130px, centered with generous margin. One per slide.
The template ships all of these as inline SVG components you can drop in.

---

## 5. Texture & background

The analog feel comes from **subtle paper texture**, full-bleed, *under* the type.
Recreate with CSS only (no asset files), keep it faint so type stays crisp:

- **Newsprint grain:** an inline SVG `feTurbulence` fractal noise at ~4–7% opacity,
  multiplied over `--paper`.
- **Grid paper (img 2):** 2 sets of `repeating-linear-gradient` hairlines at ~36px
  pitch, `--hairline` at low alpha, plus one slightly heavier "margin" rule.
- **Hole-punch / dot-margin (img 3):** a vertical strip of 2–3 soft `--ink` dots near
  the left edge (radial-gradient circles), evoking a punched page.
- **Plain paper:** just `--paper`/`--paper-2`, no lines at all. Clean and quiet.
- **Center-mark backdrop:** plain paper with ONE oversized, very faint center mark
  (spiral / asterisk / star) sitting behind the type as a watermark-ish motif.

### ⚠ Background-variety rule (MANDATORY — do not default to grid)
A carousel must NOT use the same background on every slide. Grid is one option, not
the house style. **Rotate the backdrop slide to slide** so the set feels hand-made:
- Lead with **plain paper** often — use it *generously*, it's the calmest and most
  premium. Grid and dot-margin are **accents, used sparingly** (1–2 slides per deck).
- A good 8-slide rhythm: `plain · grid · plain · dots · plain · grid · plain · mark`.
  Never two identical backdrops back to back.
- The big faint **center mark** is a backdrop flavor too (see above) — drop it in on a
  slide or two for variety. (This is the "centroid" motif from the stop/start design,
  reused quietly behind case-study type — text stays left-aligned, the mark just
  floats behind/around it.)
- Whatever the backdrop, it stays **faint**. Type legibility wins every time.
- Picking is the session's job: read the copy, give each slide a *reason* to look a
  little different from its neighbours. Uniqueness per slide is the goal, not a template.

```css
/* grain — drop this as an ::after overlay, mix-blend-mode: multiply, opacity ~.06 */
background-image: url("data:image/svg+xml,...feTurbulence...");
```
(Full, working versions of all three textures are in the template.)

---

## 6. Spacing, alignment & "feel" rules

- **Optical, not mechanical.** Center the mark *optically*. Align type to a strong
  left (or right) edge and keep it consistent within a block.
- **Tight type, loose layout.** Leading is tight (0.92) inside blocks; whitespace
  *between* the three zones is generous. Negative space is a feature.
- **Two pointer sizes max** of the serif on one slide (CTA uses a small + a giant).
- **End statements with a period.** Lowercase focal word, UPPERCASE statement.
- **No rounded corners, no shadows** (except the very faint letter-emboss on the
  TITLE slide if desired). No drop shadows on type for the workhorse slides.
- **One idea per slide.** A "stop X / start Y" pair is one idea. Don't crowd.
- **Carousel rhythm:** Cover (title) → 3–4 stop/start value slides → CTA. Alternate
  diagonal lead direction and center mark each slide.

---

## 6.9 ⚠ VOICE & COPY RULES (NON-NEGOTIABLE)

The design is dialed in. The thing that breaks these posts is **copy that sounds like
AI wrote it.** Layout/placement stays exactly as is (left-aligned, generous, one idea
per slide). What we rewrite is the *words*. Read this every time before writing copy.

**Hard bans — never, in any post:**
- **No em dashes or en dashes ( — , – ) as connectors.** This is the #1 AI tell.
  Break the thought into two short sentences, or use a comma, a period, or "and".
  Example: ~~"Zero missed calls — every subscriber kept."~~ → "Zero missed calls.
  Every subscriber stayed."
- **No "not X, but Y" / negation-flip patterns.** Banned in all forms:
  - ~~"Not a receptionist. A complete support operation."~~
  - ~~"This didn't happen. This happened."~~
  - ~~"It's not just a phone line, it's a retention engine."~~
  - ~~"They didn't lose customers. They kept them."~~
  Just say the real thing plainly: "It answers every call and keeps subscribers from
  cancelling." State what *is*, don't define it against what it isn't.
- **No corporate/AI filler:** unlock, leverage, seamless, elevate, supercharge,
  game-changer, robust, delve, "in today's fast-paced world", "that's the power of",
  "imagine a world where", "the result?". Cut them.
- **No hype-stacking adjectives** ("powerful, intelligent, fully-automated solution").
- **No forced rule-of-three triads** ("answering, saving, scaling") unless it's just
  true and plain.

**Do this instead — conversational, like a person talking:**
- Short, plain sentences. Say it the way you'd say it to a friend who runs a store.
- Use contractions (we're, it's, didn't, they'd). They read human.
- Lead with the real, specific fact or number. Concrete beats clever.
- It's fine to start with "So", "And", or "Here's what we found." Light, not stiff.
- One clear idea per slide. If a sentence needs a dash to survive, it's two sentences.
- Read it out loud in your head. If it sounds like a brand deck, rewrite it.

**Mini before/after:**
> ❌ "We didn't just answer calls — we transformed their retention." (em dash + not-just)
> ✅ "Their returning-customer rate went from 6.88% to 28.87% in 30 days."

Every slot of headline + body copy passes these checks before the deck is done.

---

## 6.95 PICTURE RULES (screenshots, photos, proof)

When the user drops in images (case-study screenshots, dashboards, receptionist UI,
team/product photos), they get a **vintage camera treatment** so they feel like prints
laid onto the page, not pasted PNGs. **Photos keep their original color**; the *frame*
is what's gray/analog. Two frames, picked by image size/role:

### A) Big / hero images → 35mm FILM-STRIP frame, CENTERED
For the important shots (the Vapi/voice receptionist screen, a dashboard, the main
proof). Place it **centered** in the slide's open space, one per slide, never over text.
- Gray film border (`#C7C5BF`-ish) with **sprocket holes** running top and bottom.
- A tiny frame label in the corner is a nice touch: `FRAME 04A · LESHAWN`, Archivo,
  ~11px, `#3A3A3A`. (No mono font — stay in the system's families.)
- Photo sits in **original color** inside the frame. Optional **very faint grain**
  over it for the film feel; do not desaturate.
- Sits flat (no tilt) when it's the centered hero.

```css
.film{display:inline-block;background:#C7C5BF;padding:30px 16px;position:relative}
.film::before,.film::after{content:"";position:absolute;left:14px;right:14px;height:16px;
  background:radial-gradient(circle, var(--paper) 42%, transparent 46%) 0 0/30px 16px repeat-x}
.film::before{top:7px} .film::after{bottom:7px}
.film img{display:block;max-width:100%}          /* keeps original color */
.film .label{position:absolute;bottom:6px;right:16px;font:600 11px var(--body);
  letter-spacing:.12em;color:#3A3A3A;text-transform:uppercase}
```

### B) Small images → tilted PRINT-BORDER snapshot, UPPER-RIGHT
For smaller supporting shots (a logo, a single metric card, a phone screen). **Tilt it
a few degrees and pin it to the upper-right half, in the empty space where there's no
text.** Like a photo dropped onto the desk.
- Off-white/gray paper border (`--paper-2`), generous bottom margin (Polaroid feel).
- `transform: rotate(-3deg)` (alternate `+2deg / -3deg` so multiples don't look cloned).
- A whisper of shadow is OK here (it's a physical print): `0 18px 40px rgba(14,14,14,.18)`.
- Photo in original color inside.

```css
.snapshot{position:absolute;top:120px;right:84px;width:360px;background:var(--paper-2);
  padding:16px 16px 44px;border:1px solid var(--hairline);transform:rotate(-3deg);
  box-shadow:0 18px 40px rgba(14,14,14,.18)}
.snapshot img{display:block;width:100%}
```

### Placement & hygiene
- **Never cover the headline or body.** The image lives in negative space only.
- **One image per slide** (a contact-sheet of several tiny frames is the only exception).
- Big shot ⇒ centered film strip. Small shot ⇒ tilted upper-right print. That's the rule.
- The frame is the only gray/analog element; everything else on the slide stays ink+paper.
- The user supplies the image path; the session just wraps it in `.film` or `.snapshot`.
- These two components ship in the templates so a session can drop images straight in.

---

## 7. How a session should USE this (the workflow)

When a future session is asked to "make a carousel from this copy":

1. **Read this file + open `carousel-template.html`.** Do not invent new colors/fonts.
2. **Map the copy to slide types:**
   - intro line / topic → **TITLE** slide (§3.3)
   - each "stop ___ / start ___" pair → one **STOP/START** slide (§3.1)
   - the call to action → **CTA** slide (§3.2)
3. **Duplicate a `.slide` block** in the template per piece of copy; paste copy into
   the focal-word and statement slots. Keep ≤3 lines per statement; **shrink font to fit**,
   never push past safe margins.
4. **Alternate**: diagonal lead direction, center mark, and texture each slide.
5. **Output strictly as one self-contained `.html` file** (fonts via Google Fonts CDN,
   everything else inline). No MCP, no build step. The user screenshots each `.slide`
   (or uses the print/export button) at 1080×1350.
6. **Sanity check before finishing:** only ink + paper (no orange), nothing clipped,
   focal word overlaps its statement, period at the end of statements, footer/handle
   filled (`loxes.ai`), no "save for later".
7. **Background-variety check (§5):** backgrounds rotate, grid used sparingly, no two
   neighbours identical, plain paper carries most of the deck.
8. **Voice check (§6.9):** read every line. Zero em/en dashes. Zero "not X, but Y".
   Zero AI filler. It reads like a person talking, not a brand deck.

### Copy template a user can hand over
```
TITLE:    CLIENT TESTIMONIAL              (or the carousel topic)
SLIDE 1:  stop | REINVENTING EVERY POST.  ||  start | USING PROVEN FRAMEWORKS.
SLIDE 2:  stop | POSTING WITHOUT A HOOK.  ||  start | LEADING WITH PATTERN INTERRUPTS.
SLIDE 3:  stop | EDITING FOR HOURS.       ||  start | BATCHING YOUR CONTENT.
CTA:      Comment the word "clarity" — to learn how we convert hundreds of
          clients through organic content that sounds like you.
```

---

## 8. Quick-reference token sheet (copy/paste)

```css
:root{
  /* color */
  --paper:#E9E7E1; --paper-2:#EFEDE8; --paper-pure:#FAFAF8;
  --ink:#0E0E0E;   --ink-soft:#2A2A2A; --ink-mute:#6B6862;
  --hairline:rgba(14,14,14,.14);

  /* type */
  --serif:"Playfair Display", Georgia, serif;     /* focal word, 900 italic   */
  --grotesque:"Archivo Black","Helvetica Neue",Arial,sans-serif; /* statement */
  --body:"Archivo","Helvetica Neue",Arial,sans-serif;            /* captions  */

  /* canvas */
  --w:1080px; --h:1350px; --safe-x:88px; --safe-y:96px;
}
```

That's the whole system. Stay in ink + paper, let the serif/grotesque tension and the
diagonal layout do the work, one mark per slide, and it will always look like the brand.
