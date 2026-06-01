#!/usr/bin/env node
/**
 * build-airtable-payload.js
 *
 * Generates the "Field Keys" text for each form in the schema, formatted as
 * one line per field: `field_key | Human-Readable Label`
 *
 * Writes _airtable-payload.json with one entry per form, ready to be merged
 * into the Form Templates table.
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const MANIFEST = JSON.parse(fs.readFileSync(path.join(ROOT, '_manifest.json'), 'utf8'));

// Airtable Form Name → recordId, from a fresh list_records_for_table call.
const AIRTABLE_RECORDS = {
  'QDRO and Joinder': 'rec6Fuks1vrXOkqyV',
  'Domestic Violence Restraining Order': 'rec8H5vzztqhiimz6',
  'Default / Uncontested Divorce Judgment': 'rec8TvYqczlS6H73H',
  'Response to Unlawful Detainer': 'rec8TzuOvoWnaakkk',
  'Last Will and Testament': 'recBKkB0uRRmjnHCl',
  'Response to DVRO': 'recBj9FfDaPIVBxV6',
  'Birth Certificate Correction': 'recE3qBuMhoj6egKv',
  'Writ of Execution': 'recHrnMPtom7LAjrB',
  'Response to Request for Orders': 'recMbdGhTakheZ6kJ',
  'Request to Restore Former Name': 'recOEZkC2q6dJSp8E',
  'Request for Orders': 'recORyE4aOIxSe7BL',
  'Client Intake Sheet': 'recWdbPMAJsrTGKqD',
  'Conservatorship of an Adult': 'recboxOEnRB4TZxTQ',
  'Unlawful Detainer - Landlord': 'rechPmW7DKscaWdLf',
  'Dissolution of Marriage': 'recj4ORm970FmusDK',
  'Name Change Petition': 'reck4BkvZRW7rLwDX',
  'Trust and Healthcare Directive': 'recrh5HlOBrWexTWy',
  'Guardianship of a Minor': 'recydhhlXmI9HgNdE',
};

// slug → Airtable Form Name (so we can look up record IDs)
const SLUG_TO_AIRTABLE = {
  'qdro-and-joinder': 'QDRO and Joinder',
  'domestic-violence-restraining-order': 'Domestic Violence Restraining Order',
  'default-uncontested-divorce-judgment': 'Default / Uncontested Divorce Judgment',
  'response-to-unlawful-detainer': 'Response to Unlawful Detainer',
  'last-will-and-testament': 'Last Will and Testament',
  'response-to-dvro': 'Response to DVRO',
  'birth-certificate-correction': 'Birth Certificate Correction',
  'writ-of-execution': 'Writ of Execution',
  'response-to-request-for-orders': 'Response to Request for Orders',
  'request-to-restore-former-name': 'Request to Restore Former Name',
  'request-for-orders': 'Request for Orders',
  'client-intake-sheet': 'Client Intake Sheet',
  'conservatorship-of-an-adult': 'Conservatorship of an Adult',
  'unlawful-detainer-landlord': 'Unlawful Detainer - Landlord',
  'dissolution-of-marriage': 'Dissolution of Marriage',
  'name-change-petition': 'Name Change Petition',
  'trust-and-healthcare-directive': 'Trust and Healthcare Directive',
  'guardianship-of-a-minor': 'Guardianship of a Minor',
};

function buildFieldKeysText(schema) {
  const lines = [];
  for (const section of schema.sections || []) {
    lines.push(`# ${section.title}`);
    for (const f of section.fields || []) {
      if (f.type === 'table' && Array.isArray(f.row_keys)) {
        const maxRows = f.max_rows || 6;
        for (let i = 1; i <= maxRows; i++) {
          for (const rk of f.row_keys) {
            const key = `${f.key}_${i}_${rk}`;
            const label = `${f.label} — Row ${i} — ${rk.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}`;
            lines.push(`${key} | ${label}`);
          }
        }
      } else {
        const label = f.label || f.key;
        const tag = f.derived ? ' (derived)' : f.optional ? ' (optional)' : '';
        lines.push(`${f.key} | ${label}${tag}`);
      }
    }
    lines.push('');
  }
  // Derived fields appendix
  if (Array.isArray(schema.derived) && schema.derived.length) {
    lines.push('# Derived (auto-computed; do not ask the caller)');
    for (const d of schema.derived) {
      lines.push(`${d.key} | derived: ${d.rule || ''}`);
    }
    lines.push('');
  }
  return lines.join('\n').trim();
}

const payload = [];
for (const form of MANIFEST.forms) {
  const schemaPath = path.join(ROOT, form.schema);
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  const airtableName = SLUG_TO_AIRTABLE[form.slug];
  if (!airtableName) {
    console.log(`SKIP ${form.slug}: no Airtable form name`);
    continue;
  }
  const recordId = AIRTABLE_RECORDS[airtableName];
  if (!recordId) {
    console.log(`SKIP ${form.slug}: no record ID`);
    continue;
  }
  const fieldKeysText = buildFieldKeysText(schema);
  // Count non-derived, non-header lines for Field Count
  const fieldCount = fieldKeysText.split('\n').filter((l) => l && !l.startsWith('#') && !l.includes('derived:')).length;
  const estimated = schema.estimated_call_minutes || {};
  payload.push({
    slug: form.slug,
    airtableName,
    recordId,
    fieldKeysText,
    fieldCount,
    estimatedMinutesIntelligent: estimated.intelligent || null,
    estimatedMinutesLiteral: estimated.literal || null,
  });
  console.log(`${form.slug}: ${fieldCount} fields, ${fieldKeysText.length} chars`);
}

fs.writeFileSync(path.join(ROOT, '_airtable-payload.json'), JSON.stringify(payload, null, 2));
console.log(`\nWrote _airtable-payload.json with ${payload.length} forms`);
