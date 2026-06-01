# Request to Restore Former Name

*Combined reference file — Document 16 of 18.* This file has three parts:
1. **Part 1** — the original source questionnaire (Markdown), exactly as previously created.
2. **Part 2** — the same questionnaire as built into the AcroForm PDF, with every AcroForm field name written exactly in the box / blank / statement it fills.
3. **Part 3** — the DocuSign/DocSpring JSON schema for this form, exactly as generated.

---

## PART 1 — Original Source Markdown

# Request to Restore Former Name – Client Questionnaire (FL-395)

**SoCal United Professional Services**
*Internal Use Only*

---

**Today's Date:** ______________________

---

## 1) Case Information

- **Court / County (where divorce was finalized):** _______________
- **Case Number:** ___________________________________________
- **Date Judgment of Dissolution Entered (FL-180):** _____________
- **Was the divorce finalized in California?** ☐ Yes  ☐ No

---

## 2) Client (Requesting Party) Information

- **Current Legal Name** (as it appears on Judgment):

- **Date of Birth:** ___________________________________________

- **Current Address:**

- **City:** _________________ **State:** ______ **Zip:** __________

- **Phone:** _________________ **Email:** ______________________

---

## 3) Former Name to Be Restored

*(This is the name client wants back — must be a prior legal name)*

- **Full Former Name** (exact spelling):

- **Is this:**
  ☐ Maiden Name  ☐ Prior Married Name  ☐ Other Former Legal Name

---

## 4) Prior Name History (Important for Accuracy)

*List all prior legal names used (if any):*

---

## 5) Judgment Details

- **Does the Judgment (FL-180) already include a request to restore name?** ☐ Yes  ☐ No
- **If yes, was it granted in the Judgment?** ☐ Yes  ☐ No  ☐ Not Sure
- **Reason you are filing FL-395 now** (if not already granted):

---

## 6) Spouse Information (For Record Only)

- **Former Spouse's Name:** ___________________________________

---

## 7) Client Confirmation

- ☐ I confirm that the name I am requesting to restore is my former legal name.
- ☐ I understand this request is part of my dissolution case and not a general name change.

---

## PART 2 — AcroForm Field Map (field names placed in their blanks)

> **Legend for Part 2:** Each `⟨field_name⟩` token is an actual AcroForm (PDF form) field, placed exactly at the blank, line, or checkbox it fills in the form. The text around it is the form's own printed text. Field names are reproduced **exactly** as they appear in the PDF's AcroForm dictionary (the `/T` field-name values).

*— Page 1 —*

SoCal United Professional Services
REQUEST TO RESTORE FORMER NAME –
CLIENT QUESTIONNAIRE (FL-395)
(Internal Use – SoCal United Professional Services)
⟨Todays Date⟩
Today’s Date: ____________________
1) CASE INFORMATION
⟨Court  County where divorce was finalized⟩
• Court / County (where divorce was finalized): __________________________
⟨Case Number⟩
• Case Number: __________________________
⟨Date Judgment of Dissolution Entered FL180⟩
• Date Judgment of Dissolution Entered (FL-180): __________________________
• Was the divorce finalized in California? ⟨Was the divorce finalized in California⟩ ☐ Yes ☐ ⟨Was the divorce finalized in California⟩ No
2) CLIENT (REQUESTING PARTY) INFORMATION
• Current Legal Name (as it appears on Judgment):
⟨Date of Birth⟩
• Date of Birth: __________________________
• Current Address:
⟨Text1⟩
⟨City⟩ ⟨State⟩ ⟨Zip⟩
City: ____________________ State: ______ Zip: ___________
⟨Phone⟩ ⟨Email⟩
• Phone: ____________________ Email: ____________________
3) FORMER NAME TO BE RESTORED
(This is the name client wants back — must be a prior legal name)
• Full Former Name (exact spelling):
⟨Text2⟩
• Is this:
⟨Maiden Name⟩ ☐ Maiden Name
⟨Prior Married Name⟩ ☐ Prior Married Name
⟨Other Former Legal Name⟩ ☐ Other Former Legal Name
4) PRIOR NAME HISTORY (IMPORTANT FOR ACCURACY)

*— Page 2 —*

SoCal United Professional Services
• List all prior legal names used (if any):
⟨fill_1⟩
⟨fill_2⟩
⟨fill_3⟩
5) JUDGMENT DETAILS
• Does the Judgment (FL-180) already include a request to restore name?
⟨Does the Judgment FL180 already include a request to restore name⟩ ☐ Yes ⟨Does the Judgment FL180 already include a request to restore name⟩ ☐ No
• If yes, was it granted in the Judgment?
⟨If yes was it granted in the Judgment⟩ ☐ Yes ⟨If yes was it granted in the Judgment⟩ ☐ No ⟨If yes was it granted in the Judgment⟩ ☐ Not Sure
• Reason you are filing FL-395 now (if not already granted):
⟨fill_4⟩
⟨fill_5⟩
6) SPOUSE INFORMATION (FOR RECORD ONLY)
• Former Spouse’s Name: ⟨6 SPOUSE INFORMATION FOR RECORD ONLY⟩ __________________________________________
7) CLIENT CONFIRMATION
• I confirm that the name I am requesting to restore is my former legal name:
⟨Yes_4⟩ ☐ Yes
• I understand this request is part of my dissolution case and not a general
name change:
⟨Yes_5⟩ ☐ Yes

---

## PART 3 — DocuSign / DocSpring JSON (as generated)

```json
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "id": "https://api.docspring.com/api/v1/templates/tpl_r69CKMGDMayYTS93AG/schema.json",
  "title": "REQUEST TO RESTORE FORMER NAME.pdf",
  "description": "JSON Schema generated by DocSpring.com",
  "definitions": {},
  "type": "object",
  "properties": {
    "todays_date": {
      "type": [
        "string",
        "null"
      ],
      "format": "date",
      "title": "Todays Date",
      "description": "Today’s Date"
    },
    "court_county_where_divorce_was_finalized": {
      "type": [
        "string",
        "null"
      ],
      "title": "Court County Where Divorce Was Finalized",
      "description": "Court / County (where divorce was finalized"
    },
    "case_number": {
      "type": [
        "string",
        "null"
      ],
      "title": "Case Number",
      "description": "Case Number"
    },
    "date_judgment_of_dissolution_entered_fl180": {
      "type": [
        "string",
        "null"
      ],
      "format": "date",
      "title": "Date Judgment of Dissolution Entered Fl180",
      "description": "Date Judgment of Dissolution Entered (FL-180"
    },
    "was_the_divorce_finalized_in_california": {
      "type": [
        "string",
        "null"
      ],
      "enum": [
        "Yes",
        "No",
        null
      ],
      "title": "Was the Divorce Finalized in California",
      "description": "Was the divorce finalized in California"
    },
    "date_of_birth": {
      "type": [
        "string",
        "null"
      ],
      "format": "date",
      "title": "Date of Birth",
      "description": "Date of Birth"
    },
    "city": {
      "type": [
        "string",
        "null"
      ],
      "title": "City",
      "description": "City"
    },
    "state": {
      "type": [
        "string",
        "null"
      ],
      "title": "State",
      "description": "State"
    },
    "zip": {
      "type": [
        "string",
        "null"
      ],
      "title": "Zip",
      "description": "Zip"
    },
    "phone": {
      "type": [
        "string",
        "null"
      ],
      "title": "Phone",
      "description": "Phone"
    },
    "email": {
      "type": [
        "string",
        "null"
      ],
      "title": "Email",
      "description": "Email"
    },
    "maiden_name": {
      "type": "boolean",
      "title": "Maiden Name",
      "description": "Maiden Name"
    },
    "prior_married_name": {
      "type": "boolean",
      "title": "Prior Married Name",
      "description": "Prior Married Name"
    },
    "other_former_legal_name": {
      "type": "boolean",
      "title": "Other Former Legal Name",
      "description": "Other Former Legal Name"
    },
    "text1": {
      "type": [
        "string",
        "null"
      ],
      "title": "Text1"
    },
    "text2": {
      "type": [
        "string",
        "null"
      ],
      "title": "Text2"
    },
    "fill_1": {
      "type": [
        "string",
        "null"
      ],
      "title": "Fill 1",
      "description": " [1]"
    },
    "fill_2": {
      "type": [
        "string",
        "null"
      ],
      "title": "Fill 2",
      "description": " [2]"
    },
    "fill_3": {
      "type": [
        "string",
        "null"
      ],
      "title": "Fill 3",
      "description": " [3]"
    },
    "does_the_judgment_fl180_already_include_a_request_to_restore_name": {
      "type": [
        "string",
        "null"
      ],
      "enum": [
        "Yes_2",
        "No_2",
        null
      ],
      "title": "Does the Judgment Fl180 Already Include a Request to Restore Name",
      "description": "Does the Judgment (FL-180) already include a request to restore name"
    },
    "if_yes_was_it_granted_in_the_judgment": {
      "type": [
        "string",
        "null"
      ],
      "enum": [
        "Yes_3",
        "No_3",
        "Not Sure",
        null
      ],
      "title": "If Yes Was It Granted in the Judgment",
      "description": "If yes, was it granted in the Judgment"
    },
    "fill_4": {
      "type": [
        "string",
        "null"
      ],
      "title": "Fill 4",
      "description": " [1]"
    },
    "fill_5": {
      "type": [
        "string",
        "null"
      ],
      "title": "Fill 5",
      "description": " [2]"
    },
    "6_spouse_information_for_record_only": {
      "type": [
        "string",
        "null"
      ],
      "title": "6 Spouse Information For Record Only",
      "description": "6) SPOUSE INFORMATION (FOR RECORD ONLY"
    },
    "yes_4": {
      "type": "boolean",
      "title": "Yes 4",
      "description": "Yes"
    },
    "yes_5": {
      "type": "boolean",
      "title": "Yes 5",
      "description": "Yes"
    }
  },
  "additionalProperties": false
}
```
