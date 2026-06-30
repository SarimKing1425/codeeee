# SoCal United — AI Systems Knowledge Base

> **Read this first.** It's the single source of truth for the SoCal United Professional Services
> AI agents (Jasmine, Catalaya, Kyrie, Zayden/Xayden). New agent sessions should read this before
> touching anything, so we don't re-explain the system every time.
>
> **No secrets are in this file on purpose.** API keys/tokens (Airtable PAT, VAPI key, Telnyx key,
> DocSpring key) are hardcoded inline inside the n8n HTTP nodes — they are NOT here and should be
> rotated + moved to n8n credentials someday.

---

## 0. Company
**SoCal United Professional Services** — a California **non-attorney legal document preparation**
firm (NOT a law firm; no legal advice). Offices: **Riverside** and **San Bernardino**. Free
15–30 min consultations. Services: document prep, attorney referrals, process server, court runner.

## 1. The agents (projects)
| Agent | Role |
|---|---|
| **Jasmine** | Inbound booking assistant (VAPI + Cal.com). Book / reschedule / cancel. |
| **Catalaya** (spelled "Cataleya" in VAPI) | Outbound calling. Appointment reminder/confirmation. Extension of Jasmine. "PNC" = potential-new-client / pre-notification call. |
| **Kyrie** | Intake / questionnaire agent. Inbound questionnaire line + outbound forms-completion + "think about it" nurture follow-up. |
| **Zayden / Xayden** | Meta ads management. Currently **inactive / out of scope**. |

> ⚠️ **"Max" = a SEPARATE client clone** (law firm "Maria O. Cook Law"). **Never touch** any
> `Max - ...` n8n workflow / VAPI assistant or the `Max — Maria O. Cook Law` Airtable base.

## 2. Platforms / tooling
- **n8n** — `https://socalai.app.n8n.cloud` (the **SoCal** instance = MCP server `n8n`, NOT `n8n-novalty_ai`).
- **VAPI** (voice) — dashboard.vapi.ai, account `socalaiagent@gmail.com`. Transcriber: Deepgram. TTS: ElevenLabs. LLM: OpenAI.
- **Airtable** — Kyrie base (intake). Catalaya uses Google Sheets instead.
- **Google Sheets** — Catalaya master booking sheet.
- **Cal.com** — booking (user `socal-ai-agent-jdingz`).
- **Telnyx** — SMS.
- **DocSpring** — fills the completed-questionnaire PDFs (`sync.api.docspring.com`).
- **OpenAI gpt-4o** — extracts form answers from call transcripts.
- **Gmail** — staff/owner notifications.

---

## 3. Key identifiers

### VAPI assistants
| Assistant (VAPI name) | ID | Use |
|---|---|---|
| `SocalAIgent - PNC bot` (Cataleya) | `802875de-b7e0-4569-ac1f-6734eac2f4bb` | Outbound appt confirmation |
| `Kyrie Inbound Receptionist - Main` | `7aeb26f1-9e19-4f5b-b2cd-9f95d0572a85` | Walk-in **kiosk** intake |
| `Kyrie - Forms` | `072dfe27-ff94-467e-8383-238126eee925` | **Outbound** forms-completion call |
| `Kyrie - Think About It` | `be94b3b3-f40b-49e0-8986-881eb056297f` | Nurture follow-up |
| `Kyrie - Forms Inbound` | `4196f714-fe1b-4a13-9ed4-94b45ae19396` | **Inbound** questionnaire line (951) |

VAPI phoneNumberIds: Cataleya outbound `c746fcb6-447e-4ca9-aad7-ddb042b3af3d`; Kyrie-Forms outbound
`11acc94e-601a-457f-a6d7-8b51eebfc545`; Think-About-It `8082c339-27c3-4893-8324-f9315da311b9`.

### Phone numbers
- **951-618-5994** — Kyrie inbound questionnaire line → assistant `Kyrie - Forms Inbound` (4196f714). Phone-number Server URL = `.../webhook/kyrie-inbound-callback` (WF3). *(Static assistant is assigned, so VAPI uses 4196f714 directly; WF3's assistant-swap response is largely moot.)*
- **909-415-3994** — SoCal **SMS sender** (Telnyx) for outbound texts.
- **909-453-0031** — office / receptionist (spoken to clients).

### Emails
- `socalconnectus@gmail.com` — Catalaya appointment **confirm / reschedule** emails.
- `socalphonecalls@gmail.com` — Catalaya ops (voicemail / no-answer / summaries).
- `kyriesocalofficeassistant@gmail.com` — Kyrie "code not recognized" staff alert.
- Xavier's inbox — receives completed questionnaire PDFs.

### Data stores
- **Catalaya master** = Google Sheet `SocalAIgent Master Spreadsheet`, id `1CIKzVDKcClN4SXOIx9GihwEG1gFNyaiRYZ6ejspoT6c`. `Sheet1` (gid=0) = bookings; `Staff intake` (gid=1565924591) = staff manual-booking form sink. Columns include: Name, Phone Number, Email, Slot time, Booking ID, Booking Status, Location, Appointment Type, Purpose of Booking, PNC Status, PNC Called At, PNC Notes.
- **Kyrie Airtable base** = `appboF9L8CJ3mGx7f` ("Kyrie — SoCal United's Intake Agent")
  - Clients `tbl4VxojMhfx4Mtdg`
  - Call Log `tblsAKvBTKmDQjOQr`
  - Tasks `tbluKrPYoGMreSOQB`
  - Form Templates `tblZB8Nfl3LCUFL22`

### Cal.com (user `socal-ai-agent-jdingz`) — reuse these, do NOT make new events
| Location | Slug | eventTypeId |
|---|---|---|
| Riverside (in-person) | `riverside-consult` | 4508660 |
| San Bernardino (in-person) | `san-bernardino-consultation` | 4508763 |
| Virtual / Google Meet | `virtual-consult` | 4679096 |
| Phone | `phone-consult` | 4679193 |
Booking link form: `cal.com/socal-ai-agent-jdingz/<slug>`. Hours: SB/online/phone Mon–Fri 10–3 PT;
Riverside Mon–Thu 11:30–2:30, Fri by appointment. *(The `Max - ...` Cal.com events are the other client — ignore.)*

---

## 4. n8n workflows

### Catalaya (Google-Sheets backed)
| Workflow | ID | What it does |
|---|---|---|
| `SocalAI - 8. PNC outbounds` | `1UbkKUn8qomWF5wAixljx` | Cron 9am. Calls clients whose appt is **today** (Booking Status=booked, PNC not done) via Cataleya. |
| `WF Manual Staff Bookings Sync + Instant Catalaya Call` | `bohWasiWFPrGRBM4` | Cron ~3h. Syncs staff Google-Form bookings into Sheet1 + **instantly** calls them; marks PNC done. |
| `SocalAI - 9. PNC Results Handler` | `2TfQQkZc20fhCFZT9Kc0t` | Webhook `pnc-call-complete` (VAPI end-of-call). Reads `pnc_status` → routes outcome emails (confirmed/reschedule/cancel → socalconnectus; voicemail/no-answer → socalphonecalls). Updates Sheet1. |
| Jasmine booking stack | `SocalAI - 1/3/7 ...` (e.g. Book Appointment `7VCeowXQ6ju67C3ykeMnY`) | Cal.com booking + lookups + post-call. |

### Kyrie (Airtable backed)
| Workflow | ID | What it does |
|---|---|---|
| `2. Kyrie Follow-Up Scheduler` | `0DjIXSaDHRI8KCl5` | Webhook `kyrie-followup-scheduler`. On Consultation Outcome=Think About It → schedule +24h follow-up + Task + set Next Follow-Up. |
| `3. Kyrie Forms Inbound` | `NGj9mQkHIWbZiwDh` | Webhook `kyrie-inbound-callback` (the 951 number's Server URL). Returns assistantId + variableValues. *(Mostly moot now — 951 has a static assistant.)* |
| `4. Signed Client Call Dispatcher (v2)` | `sdZo1YKRLadFBEnJ` | Webhook `kyrie-outbound-dispatcher`. Dials a Form-Ready client with Kyrie-Forms (072dfe27) to complete the form. Passes **recordId** + vars. Has a daily 9:30am **safety-net trigger (currently DISABLED until go-live)**. |
| `5. "Think About It" Client Call Dispatcher (v2)` | `3OErW8BkwMJHMCXF` | Cron 9am. Calls clients (Think About It + Next Follow-Up today/tomorrow) with be94b3b3. Phone is normalized to E.164. |
| `8. Post Call Processor (Unified)` | `xpGd2T4Eoe2fruRA` | Webhook. **End-of-call processor for ALL Kyrie assistants.** `Parse Call` routes by assistant ID → switch `Route by Scenario` (intake / forms / think_about_it / forms_inbound / other). Forms + Forms-Inbound branches: fetch Form Template → download MD schema → **gpt-4o extract** → **DocSpring fill PDF** → email Xavier + attach PDF to Call Log + client. **~155k chars — pull then `jq`, don't load whole.** |
| `9. Find Client (Mid-Call Tool)` | `oVoakITqvXCidIZY` | Mid-call client lookup. |
| Tool: `Kyrie - Lookup by Code` | `bQpXCDuTTDR7Cys4` | Webhook `kyrie-lookup-code`. In `{fullName, clientCode}` → out `{found, formName, matterType, formQuestions, urgent}`. |
| Tool: `Kyrie - Staff Alert` | `Txxj0WV4ipfHwTm6` | Webhook `kyrie-staff-alert`. Emails kyriesocalofficeassistant@ when a code isn't recognized. |
| Tool: `Kyrie - Book Appointment` | `egWSqpO67X7abqLF` | Webhooks `kyrie-book-appointment` + `kyrie-text-link`. Cal.com booking + confirm email/SMS; texts self-booking link (location→slug map). SMS from **909-415-3994**. |

> All four **VAPI tool webhooks** expect VAPI's tool-call envelope
> (`message.toolCalls[].function.arguments`) and respond `{ results:[{ toolCallId, result }] }`.

---

## 5. How each flow runs

### A) Kyrie inbound questionnaire (951 line) — CODE based
Staff hand the client a **"Kyrie card" with their questionnaire code** → client calls **951-618-5994**
→ assistant `4196f714` greets, asks **full name + CLIENT CODE** → calls `lookup_by_code` → gets the
right form's questions → asks them (confirm per page) → end-of-call → **WF8 `forms_inbound` branch**
→ gpt-4o extract → DocSpring PDF → emailed + attached. Unrecognized code → `notify_staff` + caller
told to ring the office (909-453-0031).

### B) Kyrie outbound forms (Kyrie calls the client)
Staff set the client's **Form Selected** + **Client Status = "Form Ready"** in Airtable → **Airtable
Automation 1** POSTs to `kyrie-outbound-dispatcher` (WF4) → WF4 dials with Kyrie-Forms (072dfe27),
passing **recordId** + the form's questions → call → **WF8 `forms` branch** → **PATCHes the exact
client by recordId (no duplicate)** → gpt-4o extract → DocSpring PDF → emailed + attached.
*(This feature was switched OFF by Xavier just before launch; we re-enabled + bug-fixed it.)*

### C) Think-About-It nurture
Consultation Outcome set to "Think About It" → **Airtable Automation 2** → WF2 schedules +24h
follow-up + Task + Next Follow-Up → daily 9am **WF5** sweeps clients due today/tomorrow → calls with
be94b3b3 → offers to **book** or **text a link**.

### D) Catalaya appointment reminder
Cron 9am **WF8(PNC)** calls clients with an appt **today**; staff-manual bookings get an **instant**
call via the Manual Sync WF → end-of-call → **WF9** routes the outcome emails.

---

## 6. Questionnaire CODES (`code-001` …)
- **Per-form-type** codes (Xavier's convention) stored in **Form Templates → `Questionnaire Code`**.
- A client never holds two of the *same* form, so **name + code** is enough to disambiguate.
- **Codes drive the INBOUND 951 line only** (the outbound forms flow uses `Form Selected`, not a code).
- `Time Sensitive = Yes` on urgent forms (DV / Request for Orders / Guardianship …) → Kyrie says
  "time is of the essence."
- 19 client forms = `code-001`…`code-020` (e.g. 001 Dissolution, 002 Unlawful Detainer-Landlord,
  005 DV Restraining Order, 007 Request for Orders, 011 Guardianship). Overview/Intake sheets are not
  client-selectable.

## 7. Airtable schema highlights
- **Clients**: Full Name, **Form Selected** (single-select; values **must match Form Templates `Form Name` 1:1**), Matter Type, Phone, Email, DOB, Preferred Office, **Client Status** (New Lead / Intake Completed / Signed-Active / **Form Ready** / Follow-Up Pending / Follow-Up Attempted / Forms Completed / …), **Consultation Outcome** (incl Think About It), Next Follow-Up, Intake Summary, Staff Tasks, Call Log (link).
- **Call Log**: one row/call. **Scenario** (routes the post-call), Form Name, Form Answers (JSON), Form Completeness, **PDF Status** (Pending/Done/Failed), Completed PDF (attachment), PDF Link, Recording Link, Retry Count/Status/Next Retry At.
- **Form Templates**: Form Name, **Questionnaire Code**, Matter Type Match, **Question Script** (voice questions), Field Keys, PDF/JSON schema (inside the **MD-files attachment**), **DocSpring Template ID**, Time Sensitive, Estimated Minutes, Field Count, Active.

## 8. Airtable automations (built in the Airtable UI — no API)
1. **Forms auto-call**: Client Status → `Form Ready` (+ Phone) → POST `kyrie-outbound-dispatcher`.
2. **Follow-up**: Consultation Outcome → `Think About It` → POST `kyrie-followup-scheduler`.

---

## 9. Status — recent changes (Jun 2026 engagement)
- ✅ Kyrie **code system** (Airtable codes + `lookup_by_code` + new greeting/flow).
- ✅ Forms-outbound **auto-call re-enabled** + fixed a **duplicate-client bug** (now PATCHes by `recordId`; added loud-fail guards for unresolved client / missing template).
- ✅ Call **recording attached** to questionnaire PDFs/emails.
- ✅ Catalaya **per-call outcome emails** (confirmed / voicemail / rescheduled / cancelled) + correct appointment date wording. *(Requires the `pnc_status` structured output on the Cataleya assistant.)*
- ✅ Think-About-It dispatcher **phone-normalization bug fixed** (E.164) + fail-soft.
- ✅ Voice agents tuned; assistant prompts updated for all Kyrie assistants + Cataleya.

## 10. Deferred / open items
- **Catalaya SMS reminder + "reply 1 / 2" confirm-reschedule loop = NOT built.** Decision: outbound-only; confirm/reschedule handled on the voice call + by email. Would need the SMS number (909-415-3994) + 10DLC A2P registration if pursued.
- Optional WF5 "don't re-call the same person within the follow-up window" guard.
- Move hardcoded secrets in n8n nodes into proper n8n credentials + rotate.

## 11. Gotchas for future sessions
- Use the **`n8n`** MCP server (socalai.app.n8n.cloud), **not** `n8n-novalty_ai`.
- **Never touch `Max - ...` anything** (separate client).
- **WF8 is huge** — `get_workflow_details` then `jq` on the saved file; don't load it whole.
- `Form Selected` (Clients) values **must stay 1:1** with Form Templates `Form Name`, or the template lookup misses (now fails loud instead of silently).
- The 951 line uses a **static assistant** (4196f714); its prompt is the source of truth, not WF3.
- Secrets are inline in n8n nodes; **don't paste them into commits/PRs/docs.**
