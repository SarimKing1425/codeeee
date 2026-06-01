#!/usr/bin/env node
/**
 * build-rename-map.js
 *
 * For each form, build a mapping:
 *   { existingPdfAcroName: newSemanticKey | null }
 *
 * Strategy: fuzzy-match the existing PDF field name against the schema's
 * field `label`s (and the labels of derived/intake-group target fields).
 *
 * Confidence levels:
 *   - exact     : normalized exact match
 *   - prefix    : one is a normalized prefix of the other
 *   - token_set : strong token overlap (>=80% of shorter side's tokens present)
 *   - none      : not mapped — kept as null
 *
 * Output: _rename-maps/<NN-slug>.json
 *   {
 *     summary: { total, exact, prefix, token_set, unmapped, duplicates },
 *     mapping: { "Old PDF field name": { newKey, confidence, candidates? } },
 *     unmapped: [ "Old field name 1", ... ]
 *   }
 *
 * NOTE: duplicates (same newKey assigned to multiple old fields) are flagged
 * so they can be reviewed before applying renames.
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const INSPECT_DIR = path.join(ROOT, '_pdf-inspection');
const FORMS_DIR = path.join(ROOT, 'forms');
const OUT_DIR = path.join(ROOT, '_rename-maps');
const MANIFEST = JSON.parse(fs.readFileSync(path.join(ROOT, '_manifest.json'), 'utf8'));

fs.mkdirSync(OUT_DIR, { recursive: true });

function normalize(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(s) {
  return normalize(s).split(' ').filter(Boolean);
}

function flattenSchemaFields(schema) {
  // Yield { key, label, type } for every field, including table row keys + derived.
  const out = [];
  for (const section of schema.sections || []) {
    for (const f of section.fields || []) {
      out.push({ key: f.key, label: f.label || f.key, type: f.type });
      if (f.type === 'table' && Array.isArray(f.row_keys)) {
        const maxRows = f.max_rows || 6;
        for (let i = 1; i <= maxRows; i++) {
          for (const rk of f.row_keys) {
            out.push({
              key: `${f.key}_${i}_${rk}`,
              label: `${f.label} Row ${i} ${rk.replace(/_/g, ' ')}`,
              type: (f.row_field_types && f.row_field_types[rk]) || 'text',
            });
          }
        }
      }
    }
  }
  // Derived fields are valid rename targets too (todays_date, total_years_married, etc.)
  for (const d of schema.derived || []) {
    if (!out.some((x) => x.key === d.key)) {
      out.push({ key: d.key, label: d.key.replace(/_/g, ' '), type: 'text' });
    }
  }
  return out;
}

function lastTokenMap(candidates) {
  // For single-token PDF names like "City", we want exactly one schema field whose
  // label ENDS with that token. Build that index once.
  const idx = new Map();
  for (const c of candidates) {
    const t = tokens(c.label);
    if (!t.length) continue;
    const last = t[t.length - 1];
    if (!idx.has(last)) idx.set(last, []);
    idx.get(last).push(c);
  }
  return idx;
}

function score(oldName, candidate) {
  const a = normalize(oldName);
  const b = normalize(candidate.label);
  if (!a || !b) return null;
  if (a === b) return { confidence: 'exact', score: 1.0 };
  if (a.startsWith(b) || b.startsWith(a)) return { confidence: 'prefix', score: 0.9 };

  const ta = new Set(tokens(a));
  const tb = new Set(tokens(b));
  if (ta.size === 0 || tb.size === 0) return null;
  let overlap = 0;
  for (const t of ta) if (tb.has(t)) overlap++;
  const shorter = Math.min(ta.size, tb.size);
  const ratio = overlap / shorter;
  if (ratio >= 0.8 && shorter >= 2) {
    return { confidence: 'token_set', score: 0.6 + 0.3 * ratio };
  }
  return null;
}

function bestMatch(oldName, candidates, lastTokenIdx) {
  let best = null;
  for (const c of candidates) {
    const s = score(oldName, c);
    if (!s) continue;
    if (!best || s.score > best.score) best = { ...s, key: c.key, label: c.label };
  }
  if (best) return best;
  // Single-token fallback: if oldName has 1-2 tokens and there's exactly one schema
  // field whose label ends with the same last token, use it.
  const t = tokens(oldName);
  if (t.length >= 1 && t.length <= 2) {
    const last = t[t.length - 1];
    const matches = lastTokenIdx.get(last);
    if (matches && matches.length === 1) {
      return { confidence: 'last_token', score: 0.5, key: matches[0].key, label: matches[0].label };
    }
  }
  return null;
}

const overall = [];

for (const form of MANIFEST.forms) {
  const inspectPath = path.join(INSPECT_DIR, `${String(form.number).padStart(2, '0')}-${form.slug}.json`);
  const schemaPath = path.join(ROOT, form.schema);
  if (!fs.existsSync(inspectPath)) {
    console.log(`SKIP: no inspection for ${form.slug}`);
    continue;
  }
  const pdfFields = JSON.parse(fs.readFileSync(inspectPath, 'utf8'));
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  const schemaFields = flattenSchemaFields(schema);
  const lastTokenIdx = lastTokenMap(schemaFields);

  const mapping = {};
  const unmapped = [];
  const keyAssignments = {}; // newKey -> [oldNames] for duplicate detection

  for (const pf of pdfFields) {
    const match = bestMatch(pf.name, schemaFields, lastTokenIdx);
    if (match) {
      mapping[pf.name] = { newKey: match.key, confidence: match.confidence, matchedLabel: match.label };
      keyAssignments[match.key] = (keyAssignments[match.key] || []).concat(pf.name);
    } else {
      mapping[pf.name] = { newKey: null, confidence: 'none' };
      unmapped.push(pf.name);
    }
  }

  const duplicates = Object.entries(keyAssignments)
    .filter(([, names]) => names.length > 1)
    .map(([key, names]) => ({ key, oldNames: names }));

  const summary = {
    total: pdfFields.length,
    exact: Object.values(mapping).filter((m) => m.confidence === 'exact').length,
    prefix: Object.values(mapping).filter((m) => m.confidence === 'prefix').length,
    token_set: Object.values(mapping).filter((m) => m.confidence === 'token_set').length,
    last_token: Object.values(mapping).filter((m) => m.confidence === 'last_token').length,
    unmapped: unmapped.length,
    duplicate_assignments: duplicates.length,
  };
  summary.match_rate = `${(((summary.total - summary.unmapped) / summary.total) * 100).toFixed(1)}%`;

  const out = { form: form.slug, summary, mapping, unmapped, duplicates };
  const outFile = path.join(OUT_DIR, `${String(form.number).padStart(2, '0')}-${form.slug}.json`);
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
  console.log(
    `${form.slug.padEnd(40)} ${summary.match_rate.padStart(6)} matched (${summary.exact} exact / ${summary.prefix} prefix / ${summary.token_set} token), ${summary.unmapped} unmapped, ${summary.duplicate_assignments} dups`
  );
  overall.push({ slug: form.slug, ...summary });
}

fs.writeFileSync(path.join(OUT_DIR, '_summary.json'), JSON.stringify(overall, null, 2));
console.log('\nWrote', OUT_DIR);
