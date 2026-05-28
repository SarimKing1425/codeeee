# BMC Make.com Build Guide — UI Click-by-Click

Build inside the **client's Make.com org**. This guide assumes Google Sheets, Gmail, and Google Calendar OAuth connections have already been created in his Make account.

**Plan tier check before you start:** Free tier caps at 2 scenarios and 1000 ops/month. This build needs 4 scenarios. Confirm Rafique is on **Core ($9/mo) or higher** before you begin. If he's on Free, the build will not run.

---

## Constants you'll paste repeatedly

| Thing | Value |
|---|---|
| Spreadsheet | `BMC_Lead_Maste - 260530` (ID: `1dl-TPKYxwdgSVsvfYQ8skBEslk4cVjR9x7RfqDJsuiU`) |
| Sheet tab | `Lead Master` |
| Table contains headers | **Yes** |
| Step 1 Assistant ID | `5950913e-bc1b-4d6a-a51c-5988fd899a9b` |
| Step 2 Assistant ID | `af6ed5d3-741d-4b2d-b036-6868922df56e` |
| VAPI API URL | `https://api.vapi.ai/call` |
| VAPI API Key | (Rafique provides — paste into Authorization headers) |
| VAPI Phone Number ID | (Rafique provides) |

**One time-saving trick:** before building Scenario 1, open Scenario settings → set the scenario timezone to **Asia/Dubai**. This makes every `now` function return UAE time automatically and removes the need for `;"Asia/Dubai"` in formatDate calls. Do this for all 4 scenarios.

---

# SCENARIO 1 — New Lead Trigger (Step 1 Call)

Create new scenario, name it **`BMC — S1 New Lead Trigger`**.

### Module 1 — Google Sheets → Search Rows

| Field | Value |
|---|---|
| Connection | his Google Sheets connection |
| Search Method | **Select from the list** |
| Drive | **My Drive** (or **Shared with me** if he shared it to you) |
| Spreadsheet | pick `BMC_Lead_Maste - 260530` |
| Sheet Name | `Lead Master` |
| Table contains headers | **Yes** |
| Row with headers | `1` |
| Filter | `Lead Status` → **Text operators: Equal to** → `New` |
| Sort order | leave blank |
| Maximum number of returned rows | `25` |
| Value render option | Formatted value |
| DateTime render option | Formatted string |

### Module 2 — Tools → Filter (set between Module 1 and Module 3)

Right-click the connection line, **Set up a filter**. Name it `UAE Calling Window`.

**Condition (AND group):**
- `{{formatDate(now; "d")}}` — **Text operator: Matches pattern** — `^[2-5]$`

**OR Condition block** (click "Add OR rule"):

Group A:
- `{{formatDate(now; "HH:mm")}}` — **Greater than or equal to** — `10:30`
- `{{formatDate(now; "HH:mm")}}` — **Less than or equal to** — `12:30`

Group B (Add OR rule):
- `{{formatDate(now; "HH:mm")}}` — **Greater than or equal to** — `15:00`
- `{{formatDate(now; "HH:mm")}}` — **Less than or equal to** — `17:30`

### Module 3 — HTTP → Make a request

| Field | Value |
|---|---|
| URL | `https://api.vapi.ai/call` |
| Method | `POST` |
| Headers | add 2:<br>• `Authorization` = `Bearer YOUR_VAPI_KEY`<br>• `Content-Type` = `application/json` |
| Body type | **Raw** |
| Content type | **JSON (application/json)** |
| Request content | paste below |
| Parse response | **Yes** |

**Request body** (map `Full Name`, `Mobile`, etc. from Module 1):
```json
{
  "assistantId": "5950913e-bc1b-4d6a-a51c-5988fd899a9b",
  "phoneNumberId": "YOUR_VAPI_PHONE_NUMBER_ID",
  "customer": {
    "number": "+{{1.`Mobile`}}",
    "name": "{{1.`Full Name`}}"
  },
  "assistantOverrides": {
    "variableValues": {
      "name": "{{1.`Full Name`}}",
      "company": "{{1.`Company`}}",
      "partner_name": "{{1.`Source Partner`}}"
    }
  },
  "metadata": {
    "sheetRowNumber": "{{1.__ROW_NUMBER__}}",
    "leadEmail": "{{1.`Lead Email`}}",
    "step": "1"
  }
}
```

> The backticks around `Mobile`, `Full Name`, etc. are required by Make when a header has spaces. Map these from the Module 1 picker — don't type them.

### Module 4 — Google Sheets → Update a Row

| Field | Value |
|---|---|
| Connection | same Google Sheets connection |
| Search Method | **Select from the list** |
| Drive / Spreadsheet / Sheet | same as Module 1 |
| Row number | map `{{1.__ROW_NUMBER__}}` |
| Table contains headers | Yes |

**Values (map only these; leave the rest blank so they don't get overwritten):**
- `Lead Status` = `Attempting`
- `Attempt Count` = `1`
- `Last Attempt` = `{{formatDate(now; "YYYY-MM-DD HH:mm")}}`
- `Call Window Used` = `{{if(parseNumber(formatDate(now; "HH")) < 13; "Morning"; "Afternoon")}}`

### Schedule
Bottom-left clock icon → **Every 15 minutes**.

### Activate. Done.

---

# SCENARIO 2 — Step 1 Outcome Webhook

Create new scenario, name it **`BMC — S2 Step 1 Outcome`**.

### Module 1 — Webhooks → Custom webhook

- Click **Add** → name it `VAPI Step 1 Webhook`.
- Copy the generated URL. Open VAPI → assistant **BMC - 1st Call Finding Time** → **Advanced → Server URL** → paste the URL.
- In VAPI **Server Messages**, enable **end-of-call-report**.
- Back in Make, click **Re-determine data structure**, then place a test call from VAPI to populate the schema.

### Module 2 — Filter

Name: `Only end-of-call-report`
- `{{1.message.type}}` — **Text: Equal to** — `end-of-call-report`

### Module 3 — Flow Control → Router

4 routes. Set up each route's **filter** (right-click the green dot on the link) as below.

---

### Route A — Not Interested → Dead

**Filter:** `{{1.message.analysis.structuredData.outcome}}` — Equal to — `Not Interested`

**Google Sheets → Update a Row**
- Row number: `{{1.message.call.metadata.sheetRowNumber}}`
- `Lead Status` = `Dead`
- `Last Attempt` = `{{formatDate(now; "YYYY-MM-DD HH:mm")}}`

---

### Route B — Speak Now (immediate Step 2)

**Filter:** `{{1.message.analysis.structuredData.speak_now}}` — Equal to — `true`

**Module B1 — Google Sheets → Update a Row**
- Row number: `{{1.message.call.metadata.sheetRowNumber}}`
- `Lead Status` = `Speak Now`
- `Last Attempt` = `{{formatDate(now; "YYYY-MM-DD HH:mm")}}`
- `Speak Now` = `Yes`

**Module B2 — Google Sheets → Get a Cell**
We need the lead's contact info (the webhook only has phone number, not company). Add Module **Get a Cell** four times — OR use one **Get Range Values** module:

Use **Google Sheets → Get Range Values**:
- Spreadsheet / Sheet: same as before
- Range: `A{{1.message.call.metadata.sheetRowNumber}}:F{{1.message.call.metadata.sheetRowNumber}}`
- Value render option: Formatted value

**Module B3 — HTTP → Make a request**
- URL: `https://api.vapi.ai/call`
- Method: `POST`
- Headers: Authorization + Content-Type as in Scenario 1
- Body type: Raw, JSON

```json
{
  "assistantId": "af6ed5d3-741d-4b2d-b036-6868922df56e",
  "phoneNumberId": "YOUR_VAPI_PHONE_NUMBER_ID",
  "customer": {
    "number": "+{{B2.values[1].`Mobile`}}",
    "name": "{{B2.values[1].`Full Name`}}"
  },
  "assistantOverrides": {
    "variableValues": {
      "name": "{{B2.values[1].`Full Name`}}",
      "company": "{{B2.values[1].`Company`}}",
      "partner_name": "{{B2.values[1].`Source Partner`}}"
    }
  },
  "metadata": {
    "sheetRowNumber": "{{1.message.call.metadata.sheetRowNumber}}",
    "leadEmail": "{{B2.values[1].`Lead Email`}}",
    "step": "2"
  }
}
```

> Replace `B2` with the actual module ID number Make assigns (e.g. `4`, `5` — Make uses numeric IDs not letters). Map from the picker.

---

### Route C — Scheduled

**Filter:** `{{1.message.analysis.structuredData.outcome}}` — Equal to — `Scheduled`

**Google Sheets → Update a Row**
- Row number: `{{1.message.call.metadata.sheetRowNumber}}`
- `Lead Status` = `Scheduled`
- `Last Attempt` = `{{formatDate(now; "YYYY-MM-DD HH:mm")}}`
- `Preferred Call Time` = `{{1.message.analysis.structuredData.preferred_time}}`
- `Preferred Call DateTime` = `{{1.message.analysis.structuredData.preferred_datetime_iso}}`

---

### Route D — No Answer or Busy (with retry logic)

**Filter (OR):**
- `{{1.message.analysis.structuredData.outcome}}` — Equal to — `No Answer`
- OR `{{1.message.analysis.structuredData.outcome}}` — Equal to — `Busy`

**Module D1 — Google Sheets → Get a Cell**
- Spreadsheet/Sheet: same
- Cell: `H{{1.message.call.metadata.sheetRowNumber}}` (Attempt Count column)
- Value render option: Unformatted value

**Module D2 — Flow Control → Router** (nested)

**Route D-i (< 3):**
- Filter: `{{D1.value}}` — Number: Less than — `3`
- **Update a Row:** Lead Status = `Attempting`, Attempt Count = `{{D1.value + 1}}`, Last Attempt = `{{formatDate(now; "YYYY-MM-DD HH:mm")}}`
- **Tools → Sleep:** Delay = `120` (2 min for TC-02 testing; see SETUP note)
- **Get Range Values:** A:F for the row (same pattern as Route B)
- **HTTP** → POST to VAPI Step 1 (assistantId `5950913e-...`) with same body as Scenario 1 Module 3, but mapping from this Get Range Values module

**Route D-ii (>= 3):**
- Filter: `{{D1.value}}` — Number: Greater than or equal to — `3`
- **Update a Row:** Lead Status = `Dead`, Last Attempt = `{{formatDate(now; "YYYY-MM-DD HH:mm")}}`

---

### Activate. Done.

---

# SCENARIO 3a — Step 2 Scheduler

Create new scenario, name it **`BMC — S3a Step 2 Scheduler`**.

### Module 1 — Google Sheets → Search Rows
Same setup as Scenario 1 Module 1, except filter:
- `Lead Status` — Text: Equal to — `Scheduled`

### Module 2 — Filter `Due within 20 min + in calling window`

Conditions (AND):
- `{{parseDate(1.`Preferred Call DateTime`; "YYYY-MM-DDTHH:mm:ssZ")}}` — Date: Less than or equal to — `{{addMinutes(now; 20)}}`
- `{{parseDate(1.`Preferred Call DateTime`; "YYYY-MM-DDTHH:mm:ssZ")}}` — Date: Greater than or equal to — `{{addMinutes(now; -5)}}`
- `{{formatDate(now; "HH:mm")}}` — Greater than or equal to — `10:30`
- `{{formatDate(now; "HH:mm")}}` — Less than or equal to — `17:30`

### Module 3 — HTTP → Make a request

Same pattern as Scenario 1 Module 3 but with **Step 2 assistant ID**:
```json
{
  "assistantId": "af6ed5d3-741d-4b2d-b036-6868922df56e",
  "phoneNumberId": "YOUR_VAPI_PHONE_NUMBER_ID",
  "customer": {
    "number": "+{{1.`Mobile`}}",
    "name": "{{1.`Full Name`}}"
  },
  "assistantOverrides": {
    "variableValues": {
      "name": "{{1.`Full Name`}}",
      "company": "{{1.`Company`}}",
      "partner_name": "{{1.`Source Partner`}}"
    }
  },
  "metadata": {
    "sheetRowNumber": "{{1.__ROW_NUMBER__}}",
    "leadEmail": "{{1.`Lead Email`}}",
    "step": "2"
  }
}
```

### Module 4 — Google Sheets → Update a Row
- Row: `{{1.__ROW_NUMBER__}}`
- `Last Attempt` = `{{formatDate(now; "YYYY-MM-DD HH:mm")}}`
- `Call Window Used` = `{{if(parseNumber(formatDate(now; "HH")) < 13; "Morning"; "Afternoon")}}`

### Schedule: Every 15 minutes. Activate.

---

# SCENARIO 3b — Step 2 Outcome Webhook (Booking)

Create new scenario, name it **`BMC — S3b Step 2 Outcome`**.

### Module 1 — Webhooks → Custom webhook
- Add new webhook `VAPI Step 2 Webhook`. Copy URL.
- VAPI → assistant **BMC - 2nd Call Discovery** → Advanced → Server URL → paste. Enable `end-of-call-report` in Server Messages.

### Module 2 — Filter (same as Scenario 2)
`{{1.message.type}}` Equal to `end-of-call-report`.

### Module 3 — Router with 3 routes

---

### Route A — Booked

**Filter:** `{{1.message.analysis.structuredData.outcome}}` Equal to `Booked`

**A1 — Google Calendar → Create an Event**

| Field | Value |
|---|---|
| Connection | his Google Calendar connection |
| Create an Event | **In Detail** |
| Calendar ID | `Primary` (or whichever calendar Rafique wants) |
| Event Name | `BMC Discovery Call - {{1.message.call.customer.name}}` |
| All Day Event | **No** |
| Start Date | `{{1.message.analysis.structuredData.meeting_datetime}}` |
| End Date | `{{formatDate(addMinutes(parseDate(1.message.analysis.structuredData.meeting_datetime; "YYYY-MM-DDTHH:mm:ssZ"); 30); "YYYY-MM-DDTHH:mm:ssZ")}}` |
| Add Google Meet | **Yes** |
| Attendees | one: email = `{{1.message.call.metadata.leadEmail}}` |
| Description | (paste below) |
| Send updates | All |
| Visibility | Default |

**Description:**
```
Lead: {{1.message.call.customer.name}}
Phone: {{1.message.call.customer.number}}
Email: {{1.message.call.metadata.leadEmail}}

Pain Point 1: {{1.message.analysis.structuredData.pain_point_1}}
Pain Point 2: {{1.message.analysis.structuredData.pain_point_2}}
Lead Score: {{1.message.analysis.structuredData.lead_score}}

Booked automatically by Sapna (BMC Step 2 agent).
```

**A2 — Google Sheets → Update a Row**
- Row: `{{1.message.call.metadata.sheetRowNumber}}`
- `Lead Status` = `Booked`
- `Last Attempt` = `{{formatDate(now; "YYYY-MM-DD HH:mm")}}`
- `Pain Point Summary` = `{{1.message.analysis.structuredData.pain_point_1}} {{1.message.analysis.structuredData.pain_point_2}}`
- `Lead Score` = `{{1.message.analysis.structuredData.lead_score}}`
- `Meeting DateTime` = `{{1.message.analysis.structuredData.meeting_datetime}}`
- `Calendar Event ID` = `{{A1.id}}` (map from Module A1 output)

**A3 — Filter: `Has email`**
- `{{1.message.call.metadata.leadEmail}}` — Text: Exists

**A4 — Gmail → Send an Email**

| Field | Value |
|---|---|
| Connection | his Gmail connection |
| To | `{{1.message.call.metadata.leadEmail}}` |
| Subject | `Your BMC discovery call is confirmed — {{formatDate(parseDate(1.message.analysis.structuredData.meeting_datetime; "YYYY-MM-DDTHH:mm:ssZ"); "dddd, MMM D [at] h:mm A")}}` |
| Content type | HTML |
| Content | (paste below) |

**Email content:**
```html
<p>Hi {{1.message.call.customer.name}},</p>
<p>Your discovery call with Rafique Hakim is confirmed for
<strong>{{formatDate(parseDate(1.message.analysis.structuredData.meeting_datetime; "YYYY-MM-DDTHH:mm:ssZ"); "dddd, MMMM D, YYYY [at] h:mm A")}} (UAE time)</strong>.</p>
<p>A calendar invitation with the Google Meet link has been sent to this email address.</p>
<p>Looking forward to speaking with you.</p>
<p>BMC Team</p>
```

**A5 — Google Sheets → Update a Row** (mark email sent)
- Row: `{{1.message.call.metadata.sheetRowNumber}}`
- `Email Sent` = `Yes`

---

### Route B — Busy (human review)

**Filter:** `{{1.message.analysis.structuredData.outcome}}` Equal to `Busy`

**Update a Row:**
- Row: `{{1.message.call.metadata.sheetRowNumber}}`
- `Lead Status` = `Scheduled` (keep it scheduled so Rafique can pick it up)
- `Last Attempt` = `{{formatDate(now; "YYYY-MM-DD HH:mm")}}`
- `Notes` = `Step 2 - Busy. Flagged for human follow up.`

---

### Route C — Not Interested

**Filter:** `{{1.message.analysis.structuredData.outcome}}` Equal to `Not Interested`

**Update a Row:**
- Row: `{{1.message.call.metadata.sheetRowNumber}}`
- `Lead Status` = `Dead`
- `Last Attempt` = `{{formatDate(now; "YYYY-MM-DD HH:mm")}}`
- `Notes` = `Step 2 - Not Interested.`

---

### Activate. Done.

---

# VAPI prerequisites Rafique must confirm

Both Sapna assistants must emit `analysis.structuredData` with these exact fields. Open VAPI → each assistant → **Analysis → Structured Data** → set this JSON schema:

**Step 1 (BMC - 1st Call Finding Time):**
```json
{
  "type": "object",
  "properties": {
    "outcome": { "type": "string", "enum": ["Not Interested", "Scheduled", "No Answer", "Busy"] },
    "speak_now": { "type": "boolean" },
    "preferred_time": { "type": "string" },
    "preferred_datetime_iso": { "type": "string" }
  },
  "required": ["outcome"]
}
```

**Step 2 (BMC - 2nd Call Discovery):**
```json
{
  "type": "object",
  "properties": {
    "outcome": { "type": "string", "enum": ["Booked", "Busy", "Not Interested"] },
    "pain_point_1": { "type": "string" },
    "pain_point_2": { "type": "string" },
    "lead_score": { "type": "string", "enum": ["Hot", "Warm", "Cold"] },
    "meeting_datetime": { "type": "string" }
  },
  "required": ["outcome"]
}
```

If any field name differs in his existing prompts, change the mapper in the affected Make module — don't break the agent prompts.

---

# TC-02 Test Note

The SRD asks you to set retry delay to 2 minutes for TC-02. Make's `Tools > Sleep` caps at **300 seconds (5 min)**, so 2 min works fine for testing. For the real 60-min delay, swap Route D-i's Sleep+HTTP for: write `Lead Status = New, Attempt Count incremented` and let Scenario 1's 15-min poll re-pick the row when it next runs (it'll naturally pick up within 60-75 min, close enough).

---

# Build order recap

1. Scenario 2 (webhook) → copy URL → VAPI Step 1 assistant Server URL
2. Scenario 3b (webhook) → copy URL → VAPI Step 2 assistant Server URL
3. Scenario 1 (scheduler) → activate
4. Scenario 3a (scheduler) → activate
5. Run TC-01 → TC-02 → TC-03. Sign off. Get paid.
