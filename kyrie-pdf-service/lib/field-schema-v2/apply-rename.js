#!/usr/bin/env node
/**
 * apply-rename.js
 *
 * Reads the rename maps from _rename-maps/ and writes rebuilt PDFs to forms-v2/.
 *
 * For each PDF field:
 *   - if mapped (any confidence): rename to the new semantic key
 *   - if unmapped: rename to `_unmapped_<original>` so it's visible as needing review
 *
 * Why prefix unmapped instead of leaving them alone? So the user can grep for
 * `_unmapped_` and see exactly what still needs human assignment, and so Kyrie
 * never accidentally writes to a garbage Anvil name.
 *
 * Originals in forms/ are untouched.
 */
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

const ROOT = __dirname;
const FORMS_DIR = path.resolve(ROOT, '..', '..', 'forms');
const OUT_DIR = path.resolve(ROOT, '..', '..', 'forms-v2');
const MAPS_DIR = path.join(ROOT, '_rename-maps');
const MANIFEST = JSON.parse(fs.readFileSync(path.join(ROOT, '_manifest.json'), 'utf8'));

fs.mkdirSync(OUT_DIR, { recursive: true });

function sanitizeSlug(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 80);
}

(async () => {
  const summary = [];
  for (const form of MANIFEST.forms) {
    const mapPath = path.join(MAPS_DIR, `${String(form.number).padStart(2, '0')}-${form.slug}.json`);
    const pdfPath = path.join(FORMS_DIR, form.pdf);
    if (!fs.existsSync(mapPath) || !fs.existsSync(pdfPath)) {
      console.log(`SKIP ${form.slug}: missing inputs`);
      continue;
    }
    const renameMap = JSON.parse(fs.readFileSync(mapPath, 'utf8')).mapping;
    const bytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const formObj = pdfDoc.getForm();

    let renamed = 0;
    let unmapped = 0;
    const collisions = [];
    const seenNewNames = new Map(); // newName -> count, to suffix duplicates

    for (const field of formObj.getFields()) {
      const oldName = field.getName();
      const entry = renameMap[oldName];
      let target;
      if (entry && entry.newKey) {
        target = entry.newKey;
        renamed++;
      } else {
        target = `_unmapped_${sanitizeSlug(oldName)}`;
        unmapped++;
      }
      // Suffix collisions to keep names unique within the form.
      const count = (seenNewNames.get(target) || 0) + 1;
      seenNewNames.set(target, count);
      const finalName = count === 1 ? target : `${target}__${count}`;
      if (count > 1) collisions.push({ key: target, oldName });
      try {
        field.acroField.setPartialName(finalName);
      } catch (e) {
        console.log(`  rename failed for ${oldName}: ${e.message}`);
      }
    }

    const outBytes = await pdfDoc.save();
    const outPath = path.join(OUT_DIR, form.pdf);
    fs.writeFileSync(outPath, outBytes);
    console.log(
      `${form.slug.padEnd(40)} renamed=${String(renamed).padStart(4)}  unmapped=${String(unmapped).padStart(4)}  collisions=${collisions.length}`
    );
    summary.push({ slug: form.slug, renamed, unmapped, collisions: collisions.length, out: path.relative(path.resolve(ROOT, '..', '..'), outPath) });
  }
  fs.writeFileSync(path.join(OUT_DIR, '_rename-summary.json'), JSON.stringify(summary, null, 2));
  console.log('\nWrote', OUT_DIR);
})();
