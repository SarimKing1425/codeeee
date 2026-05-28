// Generates lib/keyMaps.json — per-form { snake_case_pdf_field_name: "Original PDF Field Name" }
// Excludes opaque/non-semantic fields (undefined_N, Yes_2, Text1, fill_1, bare digits, etc.).
// Those are left to the GPT translator at runtime.
const fs = require('fs');
const path = require('path');
const { getFields } = require('../lib/fillPdf');

const FORMS = path.join(__dirname, '..', 'forms');
const manifest = JSON.parse(fs.readFileSync(path.join(FORMS, 'manifest.json'), 'utf8'));

const OPAQUE = [
  /^undefined(_\d+)?$/i,
  /^(yes|no|other|both|none)(_\d+)?$/i,
  /^text\d+$/i,
  /^fill[_\s]?\d+$/i,
  /^\d+$/,
  /^.{1,2}$/
];
const isOpaque = (n) => OPAQUE.some((re) => re.test(n));

const slug = (s) =>
  String(s).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

(async () => {
  const out = {};
  let kept = 0, skipped = 0;
  for (const [formName, file] of Object.entries(manifest)) {
    const fields = await getFields(fs.readFileSync(path.join(FORMS, file)));
    const map = {};
    for (const f of fields) {
      if (isOpaque(f.name)) { skipped++; continue; }
      const key = slug(f.name);
      if (!key) { skipped++; continue; }
      // Last-write wins on snake_case collisions (rare)
      map[key] = f.name;
      kept++;
    }
    out[formName] = map;
  }
  const dest = path.join(__dirname, '..', 'lib', 'keyMaps.json');
  fs.writeFileSync(dest, JSON.stringify(out, null, 2));
  console.log(`Wrote ${dest}`);
  console.log(`  Forms: ${Object.keys(out).length}`);
  console.log(`  Mapped entries: ${kept}   Skipped opaque: ${skipped}`);
})();
