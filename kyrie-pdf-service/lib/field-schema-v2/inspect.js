#!/usr/bin/env node
/**
 * inspect.js — dump each PDF's current ACRO field list to JSON.
 *
 * Output: kyrie-pdf-service/lib/field-schema-v2/_pdf-inspection/<slug>.json
 *   [{ name, type, options? }, ...]
 *
 * Used as the input to build-rename-map.js.
 */
const fs = require('fs');
const path = require('path');
const { getFields } = require('../fillPdf.js');

const ROOT = path.resolve(__dirname, '..', '..');
const FORMS_DIR = path.join(ROOT, 'forms');
const OUT_DIR = path.join(__dirname, '_pdf-inspection');
const MANIFEST = JSON.parse(fs.readFileSync(path.join(__dirname, '_manifest.json'), 'utf8'));

fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  const summary = [];
  for (const form of MANIFEST.forms) {
    const pdfPath = path.join(FORMS_DIR, form.pdf);
    if (!fs.existsSync(pdfPath)) {
      console.log(`MISSING: ${form.pdf}`);
      summary.push({ slug: form.slug, pdf: form.pdf, status: 'missing' });
      continue;
    }
    const bytes = fs.readFileSync(pdfPath);
    let fields;
    try {
      fields = await getFields(bytes);
    } catch (e) {
      console.log(`ERR ${form.pdf}: ${e.message}`);
      summary.push({ slug: form.slug, pdf: form.pdf, status: 'error', error: e.message });
      continue;
    }
    const outFile = path.join(OUT_DIR, `${String(form.number).padStart(2, '0')}-${form.slug}.json`);
    fs.writeFileSync(outFile, JSON.stringify(fields, null, 2));
    console.log(`${form.slug}: ${fields.length} fields`);
    summary.push({ slug: form.slug, pdf: form.pdf, field_count: fields.length, status: 'ok' });
  }
  fs.writeFileSync(path.join(OUT_DIR, '_summary.json'), JSON.stringify(summary, null, 2));
  console.log('\nWrote', OUT_DIR);
})();
