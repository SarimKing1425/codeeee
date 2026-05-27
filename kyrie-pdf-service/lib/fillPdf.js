/**
 * fillPdf.js
 * Reads a fillable (AcroForm) PDF and either:
 *   - getFields(): lists every field with its type + options (used to build
 *     the canonical field-key list for Airtable + the VAPI question script)
 *   - fillPdf(): merges { fieldName: value } data into the PDF and returns bytes
 *
 * No external paid service. pdf-lib is free and open source.
 */
const {
  PDFDocument,
  PDFTextField,
  PDFCheckBox,
  PDFRadioGroup,
  PDFDropdown,
  PDFOptionList,
  StandardFonts,
} = require('pdf-lib');

const TRUTHY = new Set(['true', 't', 'yes', 'y', 'x', 'on', '1', 'checked', 'selected']);

function isTruthy(v) {
  if (v === true) return true;
  if (v === false || v == null) return false;
  return TRUTHY.has(String(v).trim().toLowerCase());
}

/**
 * List every fillable field in a PDF.
 * Returns: [{ name, type, options? }]
 * type is one of: text | checkbox | radio | dropdown | multiselect
 */
async function getFields(pdfBytes) {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const form = pdfDoc.getForm();
  return form.getFields().map((f) => {
    if (f instanceof PDFCheckBox) return { name: f.getName(), type: 'checkbox' };
    if (f instanceof PDFRadioGroup) return { name: f.getName(), type: 'radio', options: f.getOptions() };
    if (f instanceof PDFDropdown) return { name: f.getName(), type: 'dropdown', options: f.getOptions() };
    if (f instanceof PDFOptionList) return { name: f.getName(), type: 'multiselect', options: f.getOptions() };
    if (f instanceof PDFTextField) return { name: f.getName(), type: 'text' };
    return { name: f.getName(), type: f.constructor.name };
  });
}

/**
 * Fill a PDF.
 * @param pdfBytes  Buffer of the blank fillable PDF
 * @param data      { fieldName: value }  - only keys present here are touched
 * @param opts      { flatten }  - flatten=true bakes values in (non-editable)
 * Returns: { bytes, filled[], skipped[], unmatched[], totalFields }
 */
async function fillPdf(pdfBytes, data, opts = {}) {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const form = pdfDoc.getForm();

  const filled = [];
  const skipped = [];

  for (const field of form.getFields()) {
    const name = field.getName();
    if (!(name in data)) continue; // never touch a field the data didn't provide

    const raw = data[name];
    if (raw == null || raw === '') {
      skipped.push({ name, reason: 'empty value' });
      continue;
    }

    try {
      if (field instanceof PDFTextField) {
        field.setText(String(raw));
        filled.push(name);
      } else if (field instanceof PDFCheckBox) {
        isTruthy(raw) ? field.check() : field.uncheck();
        filled.push(name);
      } else if (field instanceof PDFRadioGroup || field instanceof PDFDropdown) {
        const options = field.getOptions();
        const match = options.find(
          (o) => String(o).toLowerCase() === String(raw).toLowerCase()
        );
        if (match) {
          field.select(match);
          filled.push(name);
        } else {
          skipped.push({ name, reason: `value "${raw}" is not a valid option`, options });
        }
      } else if (field instanceof PDFOptionList) {
        const vals = Array.isArray(raw)
          ? raw
          : String(raw).split(',').map((s) => s.trim());
        field.select(vals);
        filled.push(name);
      } else {
        skipped.push({ name, reason: `unsupported field type: ${field.constructor.name}` });
      }
    } catch (e) {
      skipped.push({ name, reason: e.message });
    }
  }

  // keys in the data that matched no field in the PDF - useful for catching typos
  const fieldNames = new Set(form.getFields().map((f) => f.getName()));
  const unmatched = Object.keys(data).filter((k) => !fieldNames.has(k));

  // embed a standard font so filled text actually renders in every viewer
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  form.updateFieldAppearances(helvetica);

  if (opts.flatten) form.flatten();

  const out = await pdfDoc.save();
  return {
    bytes: Buffer.from(out),
    filled,
    skipped,
    unmatched,
    totalFields: fieldNames.size,
  };
}

module.exports = { getFields, fillPdf };
