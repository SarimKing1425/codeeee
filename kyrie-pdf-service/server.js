/**
 * server.js  -  Kyrie PDF Service
 *
 * Endpoints:
 *   GET  /                         health check
 *   GET  /forms                    list available form PDFs + manifest
 *   GET  /forms/:formKey/fields    list every fillable field in a form (run once per form)
 *   POST /forms/fill               fill a form with data, return hosted URL + base64
 *
 * All endpoints except /  require header  X-Api-Key: <SERVICE_API_KEY>
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const { getFields, fillPdf } = require('./lib/fillPdf');
const { uploadPdf, configured: cloudinaryReady } = require('./lib/cloudinary');

const app = express();
app.use(express.json({ limit: '5mb' }));

const FORMS_DIR = path.join(__dirname, 'forms');
const API_KEY = process.env.SERVICE_API_KEY || '';

// Manifest maps an Airtable "Form Name" -> a PDF filename in /forms.
// Optional: if a file is already named like its form, you can skip it here.
let manifest = {};
try {
  manifest = JSON.parse(fs.readFileSync(path.join(FORMS_DIR, 'manifest.json'), 'utf8'));
} catch {
  manifest = {};
}

const slug = (s) =>
  String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function listForms() {
  return fs
    .readdirSync(FORMS_DIR)
    .filter((f) => f.toLowerCase().endsWith('.pdf'));
}

// Resolve a formKey/formName to a real file path.
// Tries: manifest entry -> exact "<key>.pdf" -> slugified "<key>.pdf"
function resolveForm(key) {
  if (!key) return null;
  const candidates = [];
  if (manifest[key]) candidates.push(manifest[key]);
  candidates.push(`${key}.pdf`, `${slug(key)}.pdf`);
  for (const c of candidates) {
    const p = path.join(FORMS_DIR, c);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

// API-key guard (health check is open)
app.use((req, res, next) => {
  if (req.path === '/') return next();
  if (API_KEY && req.get('X-Api-Key') !== API_KEY) {
    return res.status(401).json({ ok: false, error: 'invalid or missing X-Api-Key' });
  }
  next();
});

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'kyrie-pdf-service',
    forms: listForms().length,
    cloudinary: cloudinaryReady(),
  });
});

app.get('/forms', (_req, res) => {
  res.json({ ok: true, files: listForms(), manifest });
});

// Run this once per form to get the real field names -> paste into Airtable
app.get('/forms/:formKey/fields', async (req, res) => {
  const file = resolveForm(req.params.formKey);
  if (!file) {
    return res
      .status(404)
      .json({ ok: false, error: `form not found: ${req.params.formKey}`, available: listForms() });
  }
  try {
    const fields = await getFields(fs.readFileSync(file));
    res.json({ ok: true, form: path.basename(file), count: fields.length, fields });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Fill a form. Body: { formName, fields: {fieldName: value}, flatten?: bool }
app.post('/forms/fill', async (req, res) => {
  const { formKey, formName, fields, flatten } = req.body || {};
  const key = formKey || formName;

  const file = resolveForm(key);
  if (!file) {
    return res
      .status(404)
      .json({ ok: false, error: `form not found: ${key}`, available: listForms() });
  }
  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) {
    return res.status(400).json({ ok: false, error: '"fields" object is required' });
  }

  try {
    const result = await fillPdf(fs.readFileSync(file), fields, { flatten: !!flatten });
    const base64 = result.bytes.toString('base64');

    let url = null;
    if (cloudinaryReady()) {
      const publicId = `kyrie-pdfs/${slug(key)}-${Date.now()}.pdf`;
      const up = await uploadPdf(result.bytes, publicId);
      url = up.secure_url;
    }

    res.json({
      ok: true,
      form: path.basename(file),
      url,
      filledCount: result.filled.length,
      totalFields: result.totalFields,
      filled: result.filled,
      skipped: result.skipped,     // fields whose value didn't apply (bad option, too long, etc.)
      unmatched: result.unmatched, // data keys that matched no field - check for typos
      base64,
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`kyrie-pdf-service listening on :${PORT}`));
