# Field Schema v2

Clean, semantic field-key system for SoCal United intake forms. Replaces the auto-generated keys in `lib/keyMaps.json` (which inherited the broken "undefined" labels from Anvil's PDF AI extraction).

## Why this exists

The old `keyMaps.json` was built by uploading the 18 PDFs to Anvil, letting their AI scrape ACRO field names, and using whatever it spit out. The result: field keys like `1_childs_full_name_as_it_currently_appears_on_the_birth_certificate`, ambiguous duplicates (`field_2`, `date_of_birth`, `address_3`), and no way to know which Airtable cell maps to which question. Downstream, that broke:

- The Airtable **Form Templates** "Field Keys" column (gibberish strings, hard to read or edit)
- Kyrie's question scripts (no clean handle for "marriage date" — had to grep through the verbose key)
- The final PDF fill step (mismatched keys → blank fields)

**v2 fixes the foundation.** One semantic name per field, used everywhere: PDF ACRO field, Airtable Field Key column value, Kyrie script variable.

## Conventions

### Naming
- `snake_case`, lowercase, ASCII only
- Semantic, not question-text-based: `marriage_date` ✅ — `date_of_marriage_question_6` ❌
- Prefix by role/scope when the form has multiple parties:
  - `petitioner_*`, `respondent_*` (family law)
  - `landlord_*`, `tenant_*` (UD)
  - `protected_*`, `restrained_*` (DVRO)
  - `participant_*`, `alternate_payee_*` (QDRO)
  - `client_*` when there's only one party
- Repeating items use 1-indexed integer suffix: `child_1_name`, `child_1_dob`, `child_2_name`...
- Checkbox groups use a parent + option pattern:
  - Parent key: `service_method` (the selected value)
  - Option keys: `service_method__personal`, `service_method__substitute`, `service_method__posted_mailed`, `service_method__other`
  - The double underscore separates parent from option

### Types
- `text` — single-line free text
- `textarea` — multi-line free text
- `date` — calendar date
- `number` — numeric value
- `currency` — dollar amount
- `phone`, `email` — formatted strings
- `checkbox` — single boolean
- `checkbox_group` — multi-select (parent + options as above)
- `radio_group` — single-select (parent + options as above)
- `table` — repeating rows (children, property, etc.); see `repeats` block per field

### Derived fields (the "intelligent path" Xavier asked about)
Fields that Kyrie should NOT ask separately. They're computed from other answers. Listed under `derived` per form, each with:
- `key` — the target field
- `from` — source field(s)
- `rule` — how it's derived

Examples:
- `todays_date` → `auto_today`
- `petitioner_age` → `years_since(petitioner_dob)`
- `total_years_married` → `years_between(marriage_date, separation_date)`
- `petitioner_city`, `petitioner_state`, `petitioner_zip` → `parse_address(petitioner_address)`

### Intake groups (one question → multiple fills)
The other half of the "intelligent path." A single Kyrie question fills multiple PDF fields. Listed under `intake_groups`. Each group has:
- `ask` — a Kyrie-flavored question stem
- `fills` — the list of target field keys
- `note` — optional, e.g. "address is broken into street/city/state/zip"

Xavier can choose per-form whether Kyrie uses these groups (faster calls) or asks each field literally (matches the form verbatim).

## File layout

```
lib/field-schema-v2/
├── README.md             # this file
├── _manifest.json        # form list + metadata
├── schema.json           # full machine-readable schema, all 18 forms
└── forms/                # per-form schema files (same content, split for review)
    ├── 01-unlawful-detainer.json
    ├── 02-writ-of-execution.json
    ├── ... (18 total)
```

`schema.json` and the per-form files are kept in sync — either is the source of truth depending on the tool consuming it. Edits should go to the per-form file, then `_manifest.json` and `schema.json` get regenerated (script TBD).

## Migration path

1. **v2 in parallel with v1** — keep `lib/keyMaps.json` untouched. Nothing currently calls `field-schema-v2/*`.
2. **Airtable column rebuild** — repopulate `Form Templates → Field Keys` using the new semantic keys for one form (Dissolution = test case).
3. **PDF ACRO rebuild** — regenerate each PDF's ACRO field names to match the new keys (one form at a time).
4. **Kyrie script rebuild** — new `questionScripts.v2.json` referencing the new keys.
5. **Cutover** — swap `fillPdf.js` to read from `field-schema-v2` instead of `keyMaps.json`. Retire v1.

## Status

| # | Form | Schema | Airtable | PDF Rebuild | Kyrie Script |
|---|------|--------|----------|-------------|--------------|
| 01 | Unlawful Detainer | ✅ v2 | — | — | — |
| 02 | Writ of Execution | ✅ v2 | — | — | — |
| 03 | Trust & Healthcare Directive | ✅ v2 | — | — | — |
| 04 | Last Will and Testament | ✅ v2 | — | — | — |
| 05 | Response to Unlawful Detainer | ✅ v2 | — | — | — |
| 06 | Response to DVRO | ✅ v2 | — | — | — |
| 07 | Response to RFO | ✅ v2 | — | — | — |
| 08 | Default / Uncontested Judgment | ✅ v2 | — | — | — |
| 09 | Guardianship of a Minor | ✅ v2 | — | — | — |
| 10 | Birth Certificate Correction | ✅ v2 | — | — | — |
| 11 | Conservatorship of an Adult | ✅ v2 | — | — | — |
| 12 | Request for Orders | ✅ v2 | — | — | — |
| 13 | Name Change Petition | ✅ v2 | — | — | — |
| 14 | QDRO & Joinder | ✅ v2 | — | — | — |
| 15 | Domestic Violence Restraining Order | ✅ v2 | — | — | — |
| 16 | Request to Restore Former Name | ✅ v2 | — | — | — |
| 17 | Dissolution of Marriage | ✅ v2 (test case) | — | — | — |
| 18 | Client Intake Sheet | ✅ v2 | — | — | — |
