# SANITY CHECK — Your S2 Blueprint

3 surgical fixes you can do inside the Make UI in 3 minutes. No re-import.

## 🔴 Bug 1 — All 4 route filters use the WRONG structured-output path

You wrote `{{1.message.analysis.structuredData.outcome}}` — but the real VAPI webhook puts it at `message.artifact.structuredOutputs.<UUID>.result.outcome` (you confirmed this in the call log).

**Fix everywhere — find/replace this in 4 route filters:**

```
{{1.message.analysis.structuredData.outcome}}
```
→
```
{{1.message.artifact.structuredOutputs.`96bbb70a-3026-41ca-be70-b5369897e45e`.result.outcome}}
```

Same for `speak_now`, `preferred_time`, `preferred_datetime_iso`:
- `{{1.message.analysis.structuredData.speak_now}}` → <code>{{1.message.artifact.structuredOutputs.\`96bbb70a-3026-41ca-be70-b5369897e45e\`.result.speak_now}}</code>
- `{{1.message.analysis.structuredData.preferred_time}}` → <code>{{1.message.artifact.structuredOutputs.\`96bbb70a-3026-41ca-be70-b5369897e45e\`.result.preferred_time}}</code>
- `{{1.message.analysis.structuredData.preferred_datetime_iso}}` → <code>{{1.message.artifact.structuredOutputs.\`96bbb70a-3026-41ca-be70-b5369897e45e\`.result.preferred_datetime_iso}}</code>

(Backticks around UUID are required — hyphens.)

## 🔴 Bug 2 — Route C filter checks the wrong field

In **Route C — Scheduled** (module id 10), your filter says:
```
{{1.message.analysis.structuredData.speak_now}} == "Scheduled"
```

That's checking `speak_now` (boolean) against the string `"Scheduled"`. Will never match.

**Fix:** change field to `outcome` AND update the path per Bug 1. Final filter should be:
```
{{1.message.artifact.structuredOutputs.`96bbb70a-3026-41ca-be70-b5369897e45e`.result.outcome}} == "Scheduled"
```

## 🔴 Bug 3 — Route D-ii (Dead) filter is off by one

In **Route D-ii (>= 3)** (module id 22), your filter says:
```
{{6.value}} >= 4
```

Should be `>= 3` per the SRD. Right now a lead with Attempt Count = 3 falls into neither the retry branch (< 3) nor the dead branch (>= 4), and stays in limbo forever.

**Fix:** change `4` → `3`.

## 🟡 Heads-up (not bugs but watch them)

### Route B (Speak Now) — getCell row reference

In module id 9, your HTTP body references `{{7.values[1].Mobile}}`. The `getCell` module's output for a range like `A{row}:F{row}` returns `values` as an array of **arrays of cells**, not a collection with named keys.

If the call to Step 2 from Speak Now branch fires but with empty `customer.number` / `customer.name`, that's why. Two options to fix:
- **Easier:** swap module 7 from `getCell` to `getSheetContent` ("Get Range Values") with `includesHeaders: true`. Then `7.values[0].Mobile` works.
- **Or index-based:** use `{{7.values[0][2]}}` for Mobile (col C = index 2), `{{7.values[0][1]}}` for Full Name, etc.

Same applies to module 17 (the retry getCell in Route D-i).

### Speak Now step metadata typo
Module 19 metadata says `"step": "3"` — should be `"1-retry"` to match what you sent in S1. Pure label, won't break anything, just confusing in logs.

### `text:equal "true"` on a boolean

Route B filter compares `speak_now` to the string `"true"`. VAPI emits it as actual boolean true. Make's IML treats bundle booleans as the text `"true"` when compared in filters, so this should work — but if Speak Now never fires when it should, try `text:equal "1"` or just `exists` as the operator.

---

# Sanity-checking complete for S1 + S2

After you apply the fixes above to S2, you can ship S3a + S3b (drag-and-drop blueprints attached). Both use Step 2 UUID `f764cf11-c0e8-4d1b-8517-de27ad3ef3da` everywhere structured output is referenced — already hardcoded, no replacement needed.
