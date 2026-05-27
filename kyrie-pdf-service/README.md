# Kyrie PDF Service

A tiny self-hosted service that fills your real fillable court/intake PDFs
with collected data and returns a hosted download link. Replaces Anvil.
No per-fill cost. Built on `pdf-lib` (free, open source).

## What it does
- `GET /forms/:formKey/fields` - lists every fillable field in a form (run once per form)
- `POST /forms/fill` - merges data into a form, uploads to Cloudinary, returns the link

## Setup

1. Put your 19 fillable PDFs in `/forms` (see `forms/README.md`).
2. Edit `forms/manifest.json` to map each Airtable "Form Name" to its filename.
3. Push this folder to a new GitHub repo.

## Deploy on Railway (recommended - always on, ~$5/mo)
1. railway.app -> New Project -> Deploy from GitHub repo -> pick this repo.
2. Railway auto-detects Node, installs deps, runs `npm start`.
3. Variables tab -> add:
   - `SERVICE_API_KEY` = a long random string (n8n will send this)
   - `CLOUDINARY_URL` = `cloudinary://API_KEY:API_SECRET@dcg024uw0`
     (get API key + secret from Cloudinary dashboard -> Settings -> API Keys)
4. Settings -> Networking -> Generate Domain. That public URL is your service URL.

## Deploy on Render (free tier - same steps, spins down when idle ~50s cold start)
1. render.com -> New -> Web Service -> connect this repo.
2. Build command `npm install`, start command `npm start`.
3. Add the same two environment variables.

## Test after deploy
```
GET  https://YOUR-URL/                          -> { ok: true, forms: 19 }
GET  https://YOUR-URL/forms                     -> lists your PDF files
GET  https://YOUR-URL/forms/divorce-petition/fields   (header X-Api-Key)
POST https://YOUR-URL/forms/fill                (header X-Api-Key)
     body: { "formName": "Divorce Petition Intake",
             "fields": { "petitioner_name": "Jane Doe", ... } }
```

## How it plugs into Kyrie
- The field names returned by `/fields` are the canonical keys. Paste them
  into the **Field Keys** field of the Form Templates table in Airtable.
- The post-call GPT extractor outputs `{ realFieldName: value }` JSON into
  the Call Log's **Form Answers (JSON)** field.
- The `Kyrie - PDF Generation & Send` n8n workflow POSTs that JSON to
  `/forms/fill` and writes the returned link back to the Call Log.
