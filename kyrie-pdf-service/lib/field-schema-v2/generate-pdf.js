#!/usr/bin/env node
/**
 * generate-pdf.js — generate a clean ACRO PDF from a schema JSON.
 *
 * Output: forms-v3/<slug>.pdf with every field's ACRO name = the schema's
 * semantic key. No Anvil mess, no _unmapped_ leftovers.
 *
 * Layout matches the originals' visual style (Helvetica, bold section headers,
 * "SoCal United Professional Services" subtitle) but is generated from scratch
 * with pdf-lib so the field names are 100% under our control.
 *
 * Usage:
 *   node generate-pdf.js 17                    # generate just form 17
 *   node generate-pdf.js all                   # generate all 18
 */
const fs = require('fs');
const path = require('path');
const {
  PDFDocument,
  StandardFonts,
  rgb,
  PDFName,
  PDFNumber,
  PDFString,
} = require('pdf-lib');

const ROOT = __dirname;
const OUT_DIR = path.resolve(ROOT, '..', '..', 'forms-v3');
const MANIFEST = JSON.parse(fs.readFileSync(path.join(ROOT, '_manifest.json'), 'utf8'));

fs.mkdirSync(OUT_DIR, { recursive: true });

// ---------- layout constants ----------
const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN_L = 54;
const MARGIN_R = 54;
const MARGIN_T = 60;
const MARGIN_B = 60;
const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R;

const FONT_BODY = 10;
const FONT_LABEL = 10;
const FONT_SECTION = 12;
const FONT_TITLE = 18;
const FONT_SUBTITLE = 11;
const FONT_FOOTNOTE = 8.5;

const FIELD_HEIGHT = 16;
const TEXTAREA_HEIGHT = 56;
const CHECKBOX_SIZE = 11;
const ROW_GAP = 4;
const SECTION_GAP = 14;
const LABEL_FIELD_GAP = 4;

// ---------- helpers ----------
function wrapText(text, font, size, maxWidth) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let current = '';
  for (const w of words) {
    const trial = current ? current + ' ' + w : w;
    if (font.widthOfTextAtSize(trial, size) <= maxWidth) {
      current = trial;
    } else {
      if (current) lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// ---------- main generator ----------
async function generateForm(form) {
  const schemaPath = path.join(ROOT, form.schema);
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

  const doc = await PDFDocument.create();
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const helvBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const helvOblique = await doc.embedFont(StandardFonts.HelveticaOblique);

  const acroForm = doc.getForm();

  let page = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN_T;

  const newPage = () => {
    page = doc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN_T;
    // Light running header
    page.drawText(schema.title, {
      x: MARGIN_L, y: PAGE_H - 40, size: 8, font: helvOblique, color: rgb(0.4, 0.4, 0.4),
    });
    y = PAGE_H - 56;
  };

  const ensureSpace = (needed) => {
    if (y - needed < MARGIN_B) newPage();
  };

  // ---------- Title block ----------
  const titleLines = wrapText(schema.title, helvBold, FONT_TITLE, CONTENT_W);
  for (const line of titleLines) {
    const w = helvBold.widthOfTextAtSize(line, FONT_TITLE);
    page.drawText(line, { x: (PAGE_W - w) / 2, y: y - FONT_TITLE, size: FONT_TITLE, font: helvBold });
    y -= FONT_TITLE + 4;
  }
  y -= 4;

  const subtitle = 'SoCal United Professional Services';
  const subW = helvBold.widthOfTextAtSize(subtitle, FONT_SUBTITLE);
  page.drawText(subtitle, { x: (PAGE_W - subW) / 2, y: y - FONT_SUBTITLE, size: FONT_SUBTITLE, font: helvBold });
  y -= FONT_SUBTITLE + 2;

  const footer = 'Client Intake — Internal Use Only';
  const ftW = helvOblique.widthOfTextAtSize(footer, FONT_FOOTNOTE);
  page.drawText(footer, { x: (PAGE_W - ftW) / 2, y: y - FONT_FOOTNOTE, size: FONT_FOOTNOTE, font: helvOblique, color: rgb(0.3, 0.3, 0.3) });
  y -= FONT_FOOTNOTE + 12;

  // Horizontal rule
  page.drawLine({ start: { x: MARGIN_L, y }, end: { x: PAGE_W - MARGIN_R, y }, thickness: 0.7, color: rgb(0.2, 0.2, 0.2) });
  y -= 16;

  // ---------- Track used field names to avoid duplicates ----------
  const usedNames = new Set();
  const uniqueName = (base) => {
    let n = base;
    let i = 2;
    while (usedNames.has(n)) n = `${base}__${i++}`;
    usedNames.add(n);
    return n;
  };

  // ---------- Field drawing primitives ----------
  function drawLabel(text, opts = {}) {
    const font = opts.bold ? helvBold : helv;
    const size = opts.size || FONT_LABEL;
    const lines = wrapText(text, font, size, CONTENT_W);
    for (const line of lines) {
      ensureSpace(size + 2);
      page.drawText(line, { x: MARGIN_L, y: y - size, size, font, color: opts.color || rgb(0, 0, 0) });
      y -= size + 2;
    }
  }

  function drawTextField(key, opts = {}) {
    const w = opts.width || CONTENT_W;
    const h = opts.multiline ? TEXTAREA_HEIGHT : FIELD_HEIGHT;
    ensureSpace(h + ROW_GAP);
    const name = uniqueName(key);
    const tf = acroForm.createTextField(name);
    if (opts.multiline) tf.enableMultiline();
    tf.addToPage(page, {
      x: MARGIN_L, y: y - h, width: w, height: h,
      borderWidth: 0.5, borderColor: rgb(0.5, 0.5, 0.5), backgroundColor: rgb(0.98, 0.98, 0.98),
    });
    y -= h + ROW_GAP;
  }

  function drawCheckbox(key, label) {
    ensureSpace(CHECKBOX_SIZE + ROW_GAP);
    const name = uniqueName(key);
    const cb = acroForm.createCheckBox(name);
    cb.addToPage(page, {
      x: MARGIN_L, y: y - CHECKBOX_SIZE, width: CHECKBOX_SIZE, height: CHECKBOX_SIZE,
      borderWidth: 0.5, borderColor: rgb(0.4, 0.4, 0.4),
    });
    const lblLines = wrapText(label, helv, FONT_LABEL, CONTENT_W - CHECKBOX_SIZE - 6);
    page.drawText(lblLines[0], {
      x: MARGIN_L + CHECKBOX_SIZE + 6, y: y - CHECKBOX_SIZE + 2,
      size: FONT_LABEL, font: helv,
    });
    y -= CHECKBOX_SIZE + ROW_GAP;
    for (let i = 1; i < lblLines.length; i++) {
      ensureSpace(FONT_LABEL + 2);
      page.drawText(lblLines[i], { x: MARGIN_L + CHECKBOX_SIZE + 6, y: y - FONT_LABEL, size: FONT_LABEL, font: helv });
      y -= FONT_LABEL + 2;
    }
  }

  function drawRadioGroup(field) {
    // Render each option as its own checkbox-style field with name `${field.key}__${option}`
    // (matches the schema convention; lets the filler set whichever option is checked)
    drawLabel(field.label + ':');
    const options = field.options || [];
    let x = MARGIN_L;
    let lineH = CHECKBOX_SIZE + ROW_GAP;
    ensureSpace(lineH);
    for (const opt of options) {
      const optLabel = String(opt).replace(/_/g, ' ');
      const labelW = helv.widthOfTextAtSize(optLabel, FONT_LABEL);
      const totalW = CHECKBOX_SIZE + 4 + labelW + 14;
      if (x + totalW > PAGE_W - MARGIN_R) {
        y -= lineH;
        x = MARGIN_L;
        ensureSpace(lineH);
      }
      const cbName = uniqueName(`${field.key}__${opt}`);
      const cb = acroForm.createCheckBox(cbName);
      cb.addToPage(page, {
        x, y: y - CHECKBOX_SIZE, width: CHECKBOX_SIZE, height: CHECKBOX_SIZE,
        borderWidth: 0.5, borderColor: rgb(0.4, 0.4, 0.4),
      });
      page.drawText(optLabel, {
        x: x + CHECKBOX_SIZE + 4, y: y - CHECKBOX_SIZE + 2, size: FONT_LABEL, font: helv,
      });
      x += totalW;
    }
    y -= lineH;
  }

  function drawSectionHeader(title) {
    y -= SECTION_GAP;
    ensureSpace(FONT_SECTION + 8);
    page.drawText(title, { x: MARGIN_L, y: y - FONT_SECTION, size: FONT_SECTION, font: helvBold });
    y -= FONT_SECTION + 2;
    page.drawLine({
      start: { x: MARGIN_L, y }, end: { x: PAGE_W - MARGIN_R, y },
      thickness: 0.4, color: rgb(0.4, 0.4, 0.4),
    });
    y -= 8;
  }

  function drawField(f) {
    // Decide rendering by type
    if (f.type === 'checkbox') {
      drawCheckbox(f.key, f.label || f.key);
      return;
    }
    if (f.type === 'radio_group') {
      drawRadioGroup(f);
      return;
    }
    if (f.type === 'textarea') {
      drawLabel(f.label + ':');
      drawTextField(f.key, { multiline: true });
      return;
    }
    if (f.type === 'table' && Array.isArray(f.row_keys)) {
      drawLabel(f.label + ':', { bold: true });
      const maxRows = f.max_rows || 4;
      for (let i = 1; i <= maxRows; i++) {
        ensureSpace(FONT_LABEL + 4);
        page.drawText(`  Row ${i}:`, { x: MARGIN_L, y: y - FONT_LABEL, size: FONT_LABEL, font: helvOblique, color: rgb(0.3, 0.3, 0.3) });
        y -= FONT_LABEL + 2;
        for (const rk of f.row_keys) {
          const rowKey = `${f.key}_${i}_${rk}`;
          const rowLabel = rk.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          drawLabel('  ' + rowLabel + ':');
          drawTextField(rowKey);
        }
        y -= 2;
      }
      return;
    }
    // Default: label + single-line text field
    let labelText = f.label || f.key;
    if (f.derived) labelText += '  (auto-computed)';
    if (f.optional) labelText += '  (optional)';
    drawLabel(labelText + ':');
    let width = CONTENT_W;
    if (f.type === 'date' || f.type === 'phone' || f.type === 'currency' || f.type === 'number') width = 160;
    if (f.type === 'email') width = 280;
    drawTextField(f.key, { width });
  }

  // ---------- Sections ----------
  for (const section of schema.sections || []) {
    drawSectionHeader(section.title);
    for (const f of section.fields || []) {
      drawField(f);
    }
  }

  // ---------- Footer note on last page ----------
  if (Array.isArray(schema.derived) && schema.derived.length) {
    y -= SECTION_GAP;
    drawSectionHeader('Auto-computed fields (do not ask the caller)');
    for (const d of schema.derived) {
      const txt = `• ${d.key} = ${d.rule || ''}`;
      drawLabel(txt, { color: rgb(0.35, 0.35, 0.35) });
    }
  }

  // Set default appearance
  acroForm.updateFieldAppearances(helv);

  const bytes = await doc.save();
  const outPath = path.join(OUT_DIR, form.pdf);
  fs.writeFileSync(outPath, bytes);
  return outPath;
}

(async () => {
  const arg = process.argv[2] || '17';
  const targets = arg === 'all'
    ? MANIFEST.forms
    : MANIFEST.forms.filter(f => String(f.number) === String(arg) || f.slug === arg);
  if (!targets.length) {
    console.error('No matching form for', arg);
    process.exit(1);
  }
  for (const form of targets) {
    const out = await generateForm(form);
    const bytes = fs.readFileSync(out);
    console.log(`${form.slug.padEnd(40)} → ${out}  (${(bytes.length / 1024).toFixed(1)} KB)`);
  }
})();
