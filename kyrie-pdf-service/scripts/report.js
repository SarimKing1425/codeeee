// Generates field-keys-report.md from forms/manifest.json using the service's
// own getFields() so the report matches what GET /forms/:key/fields returns.
const fs = require('fs');
const path = require('path');
const { getFields } = require('../lib/fillPdf');

const ROOT = path.join(__dirname, '..');
const FORMS = path.join(ROOT, 'forms');
const manifest = JSON.parse(fs.readFileSync(path.join(FORMS, 'manifest.json'), 'utf8'));

const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');

(async () => {
  const formNames = Object.keys(manifest).sort((a, b) => a.localeCompare(b));
  const lines = [];
  lines.push('# Kyrie PDF Service — Field Keys Report');
  lines.push('');
  lines.push(`_${formNames.length} forms · TOTAL_FIELDS_PLACEHOLDER fillable fields._`);
  lines.push('');
  lines.push(`Generated from the ${formNames.length} fillable AcroForm PDFs in \`forms/\`.`);
  lines.push('For each form: the Airtable **Form Name**, its PDF filename, the field count, a');
  lines.push('table of every field (name / type / options), and a paste-ready code block of just');
  lines.push('the field names for the Airtable **Field Keys** column.');
  lines.push('');
  lines.push('> Field types present across the set: `text`, `checkbox`, `radio`. No `dropdown` or');
  lines.push('> `multiselect` fields exist in any form. Checkboxes accept truthy values');
  lines.push('> (`true`/`yes`/`x`/`1`); radios accept one of their listed options (case-insensitive).');
  lines.push('');
  lines.push('---');
  lines.push('');

  let grandTotal = 0;
  for (const name of formNames) {
    const file = manifest[name];
    const fields = await getFields(fs.readFileSync(path.join(FORMS, file)));
    grandTotal += fields.length;

    lines.push(`## ${name}`);
    lines.push('');
    lines.push(`- **PDF file:** \`${file}\``);
    lines.push(`- **Field count:** ${fields.length}`);
    lines.push('');
    lines.push('| field_name | type | options |');
    lines.push('|---|---|---|');
    for (const f of fields) {
      const opts = f.options && f.options.length ? f.options.map(esc).join(', ') : '';
      lines.push(`| \`${esc(f.name)}\` | ${f.type} | ${opts} |`);
    }
    lines.push('');
    lines.push('**Field Keys (paste into Airtable):**');
    lines.push('');
    lines.push('```');
    for (const f of fields) lines.push(f.name);
    lines.push('```');
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  const out = lines.join('\n').replace('TOTAL_FIELDS_PLACEHOLDER', String(grandTotal));
  fs.writeFileSync(path.join(ROOT, 'field-keys-report.md'), out);
  console.log(`Wrote field-keys-report.md — ${formNames.length} forms, ${grandTotal} total fields.`);
})();
