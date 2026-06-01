# DocSpring Migration Guide

Step-by-step for swapping the kyrie-pdf-service render.com setup with DocSpring.

## What DocSpring is doing for us

It replaces three things at once:
1. **The PDF rendering service** (`codeeee.onrender.com/forms/fill`) — DocSpring's API fills the PDF
2. **The Anvil-generated ACRO field names** — you draw + name fields yourself in their UI, using our semantic keys
3. **The `keyMaps.json` translation layer** — no longer needed, field names ARE the semantic keys

Net result: Kyrie sends `{petitioner_full_legal_name: "Maria Lopez", marriage_date: "2018-04-12", ...}` directly to DocSpring, gets back a filled PDF URL. No translation step.

---

## Step 1 — Subscribe & get API credentials

1. Sign up at https://docspring.com — Starter plan ($25/mo)
2. Dashboard → API → copy two things:
   - **Token ID** (looks like `tok_xxxxxxxxxx`)
   - **Token Secret** (looks like a long random string — only shown once, save it)
3. Paste both into n8n credentials as a new HTTP Basic Auth credential:
   - Name: `DocSpring API`
   - User: `<Token ID>`
   - Password: `<Token Secret>`

## Step 2 — Upload the 18 PDFs

**Which PDFs to upload:** the originals in `kyrie-pdf-service/forms/*.pdf` (NOT `forms-v2/` or `forms-v3/`). The originals have the cleanest visual layout — DocSpring lets you ignore the existing garbage ACRO fields and draw new ones on top.

For each PDF:
1. DocSpring dashboard → **+ New Template** → Upload PDF
2. Name the template **exactly** as it appears in the Airtable `Form Templates → Form Name` column (e.g. "Dissolution of Marriage", "QDRO and Joinder")
3. Click **Add Fields** to open the field editor

## Step 3 — Draw and name the fields

Open Airtable → Form Templates → click into the form's row → look at the **Field Keys** column. Every line is one field you need to draw on the PDF, in this format:

```
petitioner_full_legal_name | Petitioner Full Legal Name
marriage_date | Date of Marriage
total_years_married | Total Years Married (derived)
```

For each line:
- **Find the matching question on the PDF** (visually scan — the label after the `|` tells you what to look for)
- **Drag a rectangle** over the answer area
- **Name the field** EXACTLY as the snake_case key on the left of the `|` (e.g. `petitioner_full_legal_name`)
- **Set the field type** based on the suffix or context:
  - `*_date` → Date type
  - `*_phone` → Text (DocSpring doesn't have a phone-specific type)
  - `*_email` → Text
  - `*_gross_monthly_income`, `*_amount`, `*_balance` → Number, with currency formatting
  - Anything labeled "(checkbox)" or that looks like a yes/no box → Checkbox
  - Everything else → Text (single-line) or Multiline Text for explain/description fields

### Special cases

**Fields tagged `(derived)`** — SKIP THESE. They're auto-computed by Kyrie before the API call (today's date, age from DOB, total years married, etc.). Don't draw fields for them on the PDF unless the PDF actually has a printed-out spot for the answer; if it does, just draw a regular text field with that key.

**Radio groups (`field__option` pattern)** — Lines like `existing_family_law_orders__yes` and `existing_family_law_orders__no` are the two options of one radio question. Draw two separate Checkbox fields, one for each option, naming each exactly.

**Table rows (e.g. `children_1_full_name`, `children_2_full_name`)** — The PDF has a table with multiple rows. Draw a field in each row's cell, naming them with the row number in the key. Big forms like Dissolution and DVRO have up to 10 rows pre-defined in the schema; you only need to draw fields for as many rows as the PDF actually has. Skip the rest.

**Long forms with table-row abbreviations** — Dissolution, DVRO, Trust, Last Will show `# ... rows continue (see lib/field-schema-v2/forms/ JSON for full)` in the Field Keys column. For those, open the full per-row list in the repo: `kyrie-pdf-service/lib/field-schema-v2/forms/<NN>-<slug>.json` → look at the `sections[].fields[].row_keys` array combined with `max_rows`.

## Step 4 — Mark progress in Airtable

We added two columns to **Form Templates**:
- **DocSpring Template ID** — paste the `tpl_xxxxxxxxxxxxx` ID from the DocSpring URL after creating each template
- **DocSpring Status** — set to one of: `Pending Upload` → `Uploaded` → `Fields Mapping` → `Ready (Test)` → `Live`

Update both as you go. n8n reads `DocSpring Template ID` to know which template to call.

## Step 5 — Test ONE template before doing all 18

Pick Dissolution first (it's the Xavier test case). After mapping its fields:
1. DocSpring dashboard → that template → **Test** button
2. Fill in a few values manually → click **Submit**
3. Download the generated PDF, eyeball it
4. If it looks right, mark `Ready (Test)` in Airtable
5. Then iterate the n8n cutover (Step 6) with just Dissolution
6. Once that end-to-end works on a real call, batch through the other 17

## Step 6 — n8n workflow cutover

The new workflow is `kyrie-pdf-service/n8n/workflow-docspring.json`. Differences from `workflow-v5.json`:

| What changed | Before (v5) | After (DocSpring) |
|---|---|---|
| `Prep Payload` KEY_MAPS | 1500 lines of Anvil mess | Removed entirely |
| `Fill PDF` | POST to render.com `/forms/fill` | POST to `api.docspring.com/.../submissions?wait=true` |
| `Download Filled PDF` | Fetches from render.com URL | Fetches DocSpring's `download_url` from the response |
| `Get Template ID` (NEW) | n/a | Looks up DocSpring Template ID from Airtable by Form Name |
| GPT Translator output | `{anvil_garbage_key: value}` | `{semantic_key: value}` |

To cut over:
1. Import `workflow-docspring.json` into n8n
2. Set the `DocSpring API` Basic Auth credential on the two DocSpring HTTP nodes
3. Set the Airtable PAT credential on the `Get Template ID` node
4. Set the GPT credential (same as before)
5. Disable the old `workflow-v5` for the production webhook, enable the new one
6. Run a test call. Verify the PDF lands in the Call Log row's `Completed PDF` attachment and `PDF Link` URL.

## Step 7 — When all 18 are Live

You can decommission these:
- The render.com service (`kyrie-pdf-service` deployment) — save $7/mo on the Render Standard plan
- `kyrie-pdf-service/lib/keyMaps.json` (the Anvil mess)
- `kyrie-pdf-service/lib/questionScripts.json` (only if Kyrie scripts also move into DocSpring or another system; otherwise keep)
- `forms-v2/` and `forms-v3/` (the rebuilt PDF attempts — not needed once DocSpring is the source of truth)

Keep `lib/field-schema-v2/forms/*.json` as the canonical schema documentation. It's the single source of truth for what each field means.

---

## Field-key reference (where to find what)

- **One-line summary per form:** Airtable → Form Templates → `Field Keys` column
- **Full per-row table cells:** `kyrie-pdf-service/lib/field-schema-v2/forms/<NN>-<slug>.json` → `sections[].fields[]`
- **Derived field rules:** same JSON files → `derived[]` array
- **Intake group hints (one Kyrie question → multiple PDF fields):** same JSON files → `intake_groups[]`

## Cost summary

- **Today:** Render.com Standard ($7/mo) + OpenAI API + Cloudinary free tier ≈ $7–15/mo
- **After DocSpring:** DocSpring Starter ($25/mo) + OpenAI + Cloudinary ≈ $25–35/mo
- **Savings vs current pain:** an unmeasurable amount of dev time hand-mapping Anvil field names

Net add: ~$18/mo. Worth it.
