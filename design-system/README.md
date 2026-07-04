# 📌 START HERE — Loxes AI Instagram carousels

**New session? Read this top to bottom, then read `INSTAGRAM-DESIGN-SYSTEM.md` in full.
After that you know everything this folder's previous sessions knew. Treat this as a
direct continuation.**

This folder is a self-contained system for producing Loxes AI's Instagram static posts
and carousels (especially **client case studies**) as **single, self-contained HTML
files** that export at **1080×1350**. No MCP, no build step, no external assets.

---

## The one-minute orientation

- **The look:** strict **ink + paper** (warm off-white `#E9E7E1` + near-black `#0E0E0E`).
  **No colour ever**, except a real photo inside a grey vintage frame. Type does the work:
  heavy **Archivo Black** UPPERCASE statements + one **Playfair Display italic** accent.
- **The voice:** conversational, like a person talking. **Never** an em/en dash. **Never**
  a "not X, but Y" / "this didn't happen, this happened" construction. No AI filler.
  (Full rules in §6.9 of the design system. This is the thing clients care about most.)
- **The output:** one `.html` file per deck, images **embedded as base64** so it works on
  its own. User opens it and clicks **Download all as PNG** (or screenshots each `.slide`).

## Files in this folder

| File | What it is |
|------|------------|
| **`INSTAGRAM-DESIGN-SYSTEM.md`** | The full rulebook. Colour, type, layout, **voice rules (§6.9)**, **background variety (§5)**, **picture rules (§6.95)**, and **the case-study format (§7.9)**. Read it fully before building. |
| **`leshawn-superbowl-casestudy.html`** | ⭐ The **canonical case-study deck** (screenshot-heavy, with tool lockup + film-strip proof). Clone this when the client gives you screenshots. |
| `xavier-socalunited-casestudy.html` | Example client case study (8 slides, multi-agent, framed screenshots). |
| `lemeli-supplement-casestudy.html` | ⭐ **Story-driven / no-screenshot** case study (ecom retention). Clone this for a **human, non-technical** deck carried by copy + big numbers. |
| `edric-ecom-casestudy.html` | Story-driven case study (9 slides) with the **question → outcome callout** variation. |
| `carousel-template.html` | The generic "stop / start" value-carousel template (ink + paper). |
| `loxes-retention-carousel.html` | Early example case study (ink + paper). |
| `loxes-case-study.html` | Early dark+gold experiment. **Off-brand, kept for reference only — do not copy its colours.** |
| `references/` | Inspiration a friend/client sent (e.g. dark+gold ecom decks). Story/number reference ONLY, never copy the look. |
| `images/<client>/` | That client's source screenshots (already cropped). One folder per client. |

**Two flavours of case study, both on-brand — pick per client:** screenshot-heavy proof
(clone `leshawn`/`xavier`) or story-driven typographic (clone `lemeli`/`edric`, more human).

---

## ▶ To make a new client CASE STUDY (the usual job)

1. **Read `INSTAGRAM-DESIGN-SYSTEM.md` fully** — especially §6.9 (voice), §6.95 (pictures),
   §7.9 (case-study format). Do not invent new colours, fonts, or layouts.
2. **Copy the canonical file:** `cp leshawn-superbowl-casestudy.html <client>-casestudy.html`.
3. **Get the inputs from the user:** the story/transcript + the screenshots (Vapi lists,
   dashboards, website chatbot, etc.). If they can't attach files in chat, they push them
   to a side repo and you pull the zip via `codeload.github.com/<owner>/<repo>/zip/refs/heads/main`
   (a direct `git clone` of an out-of-scope repo will 403; the zip endpoint works).
4. **Build the deck** following §7.9: cover with a **BUILT WITH** tool lockup (vapi / n8n,
   not a random client photo), numbered section slides (`01`, `02`, `03`…), framed proof
   screenshots, a 4-cell stat row, and a CTA. Rotate backgrounds (§5).
5. **Rewrite the copy** in the client's favour under §6.9. **Always credit the client:**
   "we **helped** <client> build and deploy…", never "we did it all." Use their real numbers.
6. **Screenshots:** crop clean (remove sidebars / account names / black redaction bars),
   match the crop ratio to the frame, frame per §6.95 (centered film strip for big proof,
   3-up `.film.contact` strip for several, tilted upper-right snapshot for small), then
   **embed every image as base64** so the HTML is self-contained.
7. **Verify before delivering:** render each `.slide` at 1080×1350 (headless Chromium works
   in this repo — see "How previous sessions rendered" below), check nothing clips, run the
   §7.9 finish checklist.
8. **Commit + push** to the working branch. Tell the user to open the raw `.html` and hit
   **Download all as PNG**.

## ▶ To make a generic value carousel
Use the stop/start steps in §7 and clone `carousel-template.html`. Same colour/voice rules.

---

## Hard rules (never break these)
- Ink + paper only. No orange, no gold, no third colour. (Photos keep colour, but only
  inside a grey frame.)
- No em/en dashes. No "not X, but Y". Conversational. (§6.9)
- Credit the client: "we helped them build/deploy".
- Backgrounds vary per slide; plain paper carries most of the deck. (§5)
- One self-contained HTML, images embedded as base64, exports 1080×1350.

## How previous sessions rendered & embedded (so you can too)
- **Render to verify:** `npm i -D playwright-core` then drive the pre-installed Chromium at
  `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`. Force `:root{--scale:1}`, wait for
  `document.fonts.ready`, screenshot each `.slide` element (true 1080×1350). Revert the
  `package.json`/`package-lock.json` changes before committing.
- **Embed images:** replace each `src="images/<client>/<name>.png"` with a
  `data:image/png;base64,…` URI. To edit later, de-embed (swap data URIs back to paths in
  document order), make changes, re-embed. Never ship a deck that needs a separate folder.
- **Crop screenshots:** load the PNG as a data URI in a page, draw the clean region to a
  canvas, `toDataURL`, write the file. Match the crop aspect to the frame.

That's it. Read the design system, clone LeShawn, follow §7.9, keep it ink + paper, keep the
voice human, embed the images. You're now caught up.
