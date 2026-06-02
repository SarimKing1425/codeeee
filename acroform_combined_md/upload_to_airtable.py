#!/usr/bin/env python3
"""
Upload the 18 combined AcroForm reference .md files into the Airtable
"Form Templates" table, attaching each file to the correct record's
"MD files (...)" attachment field.

WHAT YOU NEED
-------------
1. Python 3 (no third-party libs required — uses urllib only).
2. An Airtable Personal Access Token (PAT) with these scopes:
      data.records:read   data.records:write
   and access to the base "Kyrie — SoCal United's Intake Agent".
   Create one at: https://airtable.com/create/tokens
3. The 18 .md files in a local folder (default: the folder this script
   lives in). They are named 01_*.md ... 18_*.md.

HOW TO RUN
----------
    export AIRTABLE_PAT="patXXXXXXXXXXXXXX"          # your token
    python3 upload_to_airtable.py                     # uses ./ as md folder
    # or:  python3 upload_to_airtable.py /path/to/md_folder

It matches each Airtable record by its "Form Name" to the right .md file,
then appends the file to the attachment field. Re-running APPENDS again, so
only run once (or clear the field first if you re-run).
"""

import base64
import json
import os
import sys
import time
import urllib.request
import urllib.parse
import urllib.error

# ---- Your base / table / field (taken from your Airtable URL) ----
BASE_ID  = "appboF9L8CJ3mGx7f"
TABLE_ID = "tblZB8Nfl3LCUFL22"
FIELD_NAME = "MD files (Full PDF template + Field Sketched Template + JSON payload)"

PAT = os.environ.get("AIRTABLE_PAT", "").strip()

# ---- Map: normalized Airtable "Form Name" -> local md filename ----
FILE_BY_FORM = {
    "client intake sheet":                    "18_Client_Intake_Sheet.md",
    "dissolution of marriage":                "17_Dissolution_of_Marriage.md",
    "default uncontested divorce judgment":   "08_Default_Uncontested_Judgment.md",
    "domestic violence restraining order":    "15_Domestic_Violence_Restraining_Order.md",
    "response to dvro":                       "06_Response_to_DVRO.md",
    "guardianship of a minor":                "09_Guardianship_Intake_Sheet.md",
    "conservatorship of an adult":            "11_Conservatorship_of_Adult.md",
    "last will and testament":                "04_Last_Will_and_Testament.md",
    "trust and healthcare directive":         "03_Trust_and_Healthcare_Directive.md",
    "name change petition":                   "13_Name_Change.md",
    "request for orders":                     "12_Request_for_Orders.md",
    "response to request for orders":         "07_Response_to_RFO.md",
    "unlawful detainer landlord":             "01_Unlawful_Detainer.md",
    "response to unlawful detainer":          "05_Response_to_Unlawful_Detainer.md",
    "birth certificate correction":           "10_Birth_Certificate_Correction.md",
    "request to restore former name":         "16_Request_to_Restore_Former_Name.md",
    "qdro and joinder":                       "14_QDRO_and_Joinder.md",
    "writ of execution":                      "02_Writ_of_Execution.md",
}

def norm(s):
    out = []
    for ch in (s or "").lower():
        out.append(ch if ch.isalnum() else " ")
    return " ".join("".join(out).split())

def match_file(form_name):
    n = norm(form_name)
    if n in FILE_BY_FORM:
        return FILE_BY_FORM[n]
    # fallback: pick the key that best matches (longest key contained in n)
    best = None
    for k, v in FILE_BY_FORM.items():
        if k in n or n in k:
            if best is None or len(k) > len(best[0]):
                best = (k, v)
    return best[1] if best else None

def api(url, method="GET", token=None, data=None, headers=None):
    h = {"Authorization": f"Bearer {token}"}
    if headers:
        h.update(headers)
    body = None
    if data is not None:
        body = json.dumps(data).encode("utf-8")
        h["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=body, method=method, headers=h)
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode("utf-8"))

def list_records(token):
    recs, offset = [], None
    base = f"https://api.airtable.com/v0/{BASE_ID}/{TABLE_ID}"
    while True:
        q = {"pageSize": "100"}
        if offset:
            q["offset"] = offset
        url = base + "?" + urllib.parse.urlencode(q)
        j = api(url, token=token)
        recs.extend(j.get("records", []))
        offset = j.get("offset")
        if not offset:
            break
    return recs

def upload_attachment(token, record_id, filename, content_bytes):
    field = urllib.parse.quote(FIELD_NAME, safe="")
    url = f"https://content.airtable.com/v0/{BASE_ID}/{record_id}/{field}/uploadAttachment"
    data = {
        "contentType": "text/markdown",
        "filename": filename,
        "file": base64.b64encode(content_bytes).decode("ascii"),
    }
    return api(url, method="POST", token=token, data=data)

def main():
    if not PAT:
        sys.exit("ERROR: set your token first:  export AIRTABLE_PAT=pat...")
    md_dir = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))
    print(f"Reading .md files from: {md_dir}\n")

    records = list_records(PAT)
    print(f"Found {len(records)} Airtable records in the table.\n")

    ok, skipped = 0, []
    for rec in records:
        form = rec.get("fields", {}).get("Form Name", "")
        fname = match_file(form)
        if not fname:
            skipped.append((form, "no filename match"))
            continue
        path = os.path.join(md_dir, fname)
        if not os.path.exists(path):
            skipped.append((form, f"file not found: {fname}"))
            continue
        with open(path, "rb") as f:
            content = f.read()
        try:
            upload_attachment(PAT, rec["id"], fname, content)
            print(f"  OK  {form!r}  <-  {fname}")
            ok += 1
        except urllib.error.HTTPError as e:
            skipped.append((form, f"HTTP {e.code}: {e.read().decode('utf-8')[:200]}"))
        time.sleep(0.25)  # stay under Airtable's 5 req/sec limit

    print(f"\nDone. Uploaded {ok} file(s).")
    if skipped:
        print("\nNOT uploaded (check these):")
        for form, why in skipped:
            print(f"  - {form!r}: {why}")

if __name__ == "__main__":
    main()
