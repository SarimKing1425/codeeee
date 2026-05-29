# SANITY CHECK — Your S1 Blueprint

I read `BMC — S1 New Lead Trigger.blueprint.json` line by line against the working VAPI payload you showed me. Here's what I found.

## 🔴 Bug 1 — UAE Calling Window filter logic is INVERTED

**Location:** module id 4 (HTTP), `filter.conditions`

You have:
```
[ [ day matches 2-5 ] ]
[ [ HH:mm >= 10:30 AND <= 12:30 ] ]
[ [ HH:mm >= 15:00 AND <= 17:00 ] ]
```

In Make's filter syntax, **outer array = OR groups, inner array = AND within group.** So your filter currently reads:

> Fire if `day in 2-5` **OR** `time in morning` **OR** `time in afternoon`

That means at 11am on a **Sunday** the morning condition passes and the call fires. Same on Monday. That breaks Rafique's "no calls Sat/Sun/Mon" rule.

**Fix:** combine into 2 OR branches, each AND'd with the day check:
```json
"conditions": [
  [
    { "a": "{{formatDate(now; \"d\")}}", "o": "text:pattern", "b": "^[2-5]$" },
    { "a": "{{formatDate(now; \"HH:mm\")}}", "o": "text:greaterorequal", "b": "10:30" },
    { "a": "{{formatDate(now; \"HH:mm\")}}", "o": "text:lessorequal", "b": "12:30" }
  ],
  [
    { "a": "{{formatDate(now; \"d\")}}", "o": "text:pattern", "b": "^[2-5]$" },
    { "a": "{{formatDate(now; \"HH:mm\")}}", "o": "text:greaterorequal", "b": "15:00" },
    { "a": "{{formatDate(now; \"HH:mm\")}}", "o": "text:lessorequal", "b": "17:30" }
  ]
]
```

Note also: SRD says afternoon is until **17:30**, you wrote **17:00**.

## 🔴 Bug 2 — Wrong operator on day-of-week

You used `text:equal` against `^[2-5]$`. `text:equal` does a literal string match — `"3"` does not literally equal `"^[2-5]$"`, so this condition **never** passes (which is part of why bug 1 doesn't fail-closed). 

**Fix:** change operator to `text:pattern` (Matches pattern). Already reflected above.

## 🟡 Bug 3 — Spreadsheet ID has a typo

URL in your sheet: `1dl-TPKYxwdgSVsvfYQ8skBEslk4cVjR9x7RfqDJsuiU` (lowercase **L**)
Blueprint has: `1dI-TPKYxwdgSVsvfYQ8skBEslk4cVjR9x7RfqDJsuiU` (capital **I**)

If your scenario opens the file fine in Make UI, this is just visual (Make uses the OAuth file picker internally). But it'll bite you if you re-import the blueprint into a different account. Update to lowercase L.

## 🟡 Bug 4 — `http:ActionSendDataBasicAuth` while not using basic auth

You picked the "HTTP > Make a Basic Auth request" module (`http:ActionSendDataBasicAuth`), then you ALSO set `Authorization: Bearer <vapi-key>` as a manual header. The Basic Auth keychain (key 172894) is unused dead weight.

**Fix:** swap module to plain `http:ActionSendData` (HTTP > Make a request). Same fields, just no Basic Auth keychain field. Cosmetic — works either way.

---

# CRITICAL — Structured Output path is different from what I told you earlier

Looking at the actual VAPI webhook payload you pasted, the structured output lives at:

```
message.artifact.structuredOutputs.<UUID>.result.<field>
```

Not at `message.analysis.structuredData.<field>` like the build guide said. **My fault — VAPI changed this when they moved from Analysis-based structured data to the new Composer/Structured Outputs system. Update the build guide in your head.**

## How to access it in Make IML

The UUID for **Step 1** is fixed (from your call log):
```
96bbb70a-3026-41ca-be70-b5369897e45e
```

So in Make filters and mappers for Scenario 2 (S2), replace every:

| Old (wrong) | New (correct) |
|---|---|
| `{{1.message.analysis.structuredData.outcome}}` | <code>{{1.message.artifact.structuredOutputs.\`96bbb70a-3026-41ca-be70-b5369897e45e\`.result.outcome}}</code> |
| `{{1.message.analysis.structuredData.speak_now}}` | <code>{{1.message.artifact.structuredOutputs.\`96bbb70a-3026-41ca-be70-b5369897e45e\`.result.speak_now}}</code> |
| `{{1.message.analysis.structuredData.preferred_time}}` | <code>{{1.message.artifact.structuredOutputs.\`96bbb70a-3026-41ca-be70-b5369897e45e\`.result.preferred_time}}</code> |
| `{{1.message.analysis.structuredData.preferred_datetime_iso}}` | <code>{{1.message.artifact.structuredOutputs.\`96bbb70a-3026-41ca-be70-b5369897e45e\`.result.preferred_datetime_iso}}</code> |

> The backticks around the UUID are **required** — Make IML treats anything with hyphens as a sub-expression and needs the literal-key escape.

For **Step 2** the UUID is unknown until you do your first test call. After Sapna's Step 2 test call lands on the S3b webhook, open the bundle, find `message.artifact.structuredOutputs.<UUID>.result.outcome`, copy that UUID, and paste it into the S3b mappers wherever I left a placeholder `REPLACE_WITH_STEP2_UUID`.

## Bonus — UUID-agnostic version

If you don't want to hardcode UUIDs, use `toArray()` so it grabs whatever structured output is present:

```
{{first(toArray(1.message.artifact.structuredOutputs)).result.outcome}}
```

This works as long as the assistant only emits ONE structured output (which is your case). I used the hardcoded-UUID version in the blueprints below because it's more explicit when debugging, but feel free to swap.

---

# I could not read your S2 blueprint

You attached two files both named `Step_1_Outcome_Webhook.blueprint.json` but the system only loaded S1. To sanity-check S2, re-attach with a different name (`S2_blueprint.json`) and I'll do the same line-by-line pass. In the meantime, the **only** change you almost certainly need to make in S2 is updating every structured-output path per the table above.
