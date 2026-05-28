# BMC Make.com Build - Setup Checklist

Spreadsheet ID and VAPI assistant IDs are already hardcoded from the SRD:
- Spreadsheet: `1dl-TPKYxwdgSVsvfYQ8skBEslk4cVjR9x7RfqDJsuiU`
- Sheet/tab: `Lead Master`
- Step 1 assistant (Sapna 1st Call Finding Time): `5950913e-bc1b-4d6a-a51c-5988fd899a9b`
- Step 2 assistant (Sapna 2nd Call Discovery): `af6ed5d3-741d-4b2d-b036-6868922df56e`

## Things you still must replace on import
1. `REPLACE_WITH_VAPI_API_KEY` - in Scenario 1, 2, 3a (Authorization headers)
2. `REPLACE_WITH_VAPI_PHONE_NUMBER_ID` - same 3 places
3. Connections (`__IMTCONN__: null`) - Make will prompt for Google + Gmail OAuth on first save

## Import order
1. **Scenario 2** first (webhook) - copy generated URL
2. **Scenario 3b** (webhook) - copy generated URL
3. Paste both URLs into VAPI: open each assistant > Advanced > Server URL = the corresponding Make webhook URL. Set "Server Messages" to include `end-of-call-report`.
4. **Scenario 1**, then **Scenario 3a** - activate last.

## Row correlation
No "VAPI Call ID" column is used. Instead each call passes `metadata.sheetRowNumber` to VAPI, and the webhook receives it back at `1.message.call.metadata.sheetRowNumber`. That is what every webhook update uses to find the row.

## VAPI agent prompt variables
The HTTP body sends `assistantOverrides.variableValues` with `name`, `company`, `partner_name`. Make sure both Sapna prompts use `{{name}}`, `{{company}}`, `{{partner_name}}` (they already do per your screenshots).

## VAPI agent structured-output schema
Both assistants must emit `analysis.structuredData` with these exact field names. Confirm under VAPI > Assistant > Analysis > Structured Data:

**Step 1 agent:**
- `outcome` (string: "Not Interested" | "Scheduled" | "No Answer" | "Busy")
- `speak_now` (boolean)
- `preferred_time` (string, human readable e.g. "Thursday 3pm")
- `preferred_datetime_iso` (string, ISO 8601 with offset e.g. "2026-05-30T15:00:00+04:00")

**Step 2 agent:**
- `outcome` (string: "Booked" | "Busy" | "Not Interested")
- `pain_point_1` (string)
- `pain_point_2` (string)
- `lead_score` (string: "Hot" | "Warm" | "Cold")
- `meeting_datetime` (string, ISO 8601 with offset)

If any field name differs, just edit the mapper in the affected module - the rest of the scenario is wired correctly.

## Mobile format
Sheet stores `971XXXXXXXXX` (no plus). The HTTP body prepends `+` for VAPI E.164: `"+{{replace(1.`C`; \"+\"; \"\")}}"`.

## Retry delay caveat (TC-02)
`util:Sleep` is capped at 300s (5 min) by Make. For the 60-minute retry the spec wants, the cleanest answer is:
- Replace the Sleep + retry HTTP in Scenario 2 with: set Status back to `New`, write a `NextAttemptAt` value, and let Scenario 1 re-pick it once the time passes.

For TC-02 testing the SRD literally says "Set Make.com retry delay to 2 minutes" - so for the test, change the Sleep duration from 300 to 120 and the test passes. After the test, swap to the queue-back-to-Scenario-1 approach for the real 60-min delay.

## Column index reference (used in `values` mappers)
Make.com sheet updateRow uses zero-indexed keys when `includesHeaders: true`. The mapping:
- 0 A Lead ID
- 1 B Full Name
- 2 C Mobile
- 3 D Company
- 4 E Source Partner
- 5 F Lead Email
- 6 G Lead Status
- 7 H Attempt Count
- 8 I Last Attempt
- 9 J Call Window Used
- 10 K Preferred Call Time
- 11 L Preferred Call DateTime
- 12 M Speak Now
- 13 N Pain Point Summary
- 14 O Lead Score
- 15 P Meeting DateTime
- 16 Q Calendar Event ID
- 17 R Email Sent
- 18 S Notes

## Calling window logic
Scenario 1 has a 2-clause filter:
- Tue/Wed/Thu/Fri (Asia/Dubai day-of-week 2-5)
- AND time between 10:30-12:30 OR 15:00-17:30

Leads added on Mon/weekend or after hours simply skip until next valid 15-minute poll inside a window.

## Scenario 3a window relaxation
Step 2 still respects 10:30-17:30 broadly, but does NOT enforce the lunch gap - because the lead picked a specific time. If you want hard enforcement, tighten the filter to match both windows exactly.
