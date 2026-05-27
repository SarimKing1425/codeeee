// One-off sanity check: load every PDF in forms/ and report field count + types.
// Flags any PDF with 0 fields (XFA or flat) as FAIL.
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

const FORMS = path.join(__dirname, '..', 'forms');

(async () => {
  const files = fs.readdirSync(FORMS).filter((f) => f.toLowerCase().endsWith('.pdf')).sort();
  let failures = 0;
  for (const file of files) {
    try {
      const doc = await PDFDocument.load(fs.readFileSync(path.join(FORMS, file)), { ignoreEncryption: true });
      const fields = doc.getForm().getFields();
      const fieldTypes = {};
      for (const f of fields) {
        const t = f.constructor.name.replace(/^PDF/, '');
        fieldTypes[t] = (fieldTypes[t] || 0) + 1;
      }
      const status = fields.length === 0 ? 'FAIL (0 fields)' : 'OK';
      if (fields.length === 0) failures++;
      console.log(JSON.stringify({ filename: file, fieldCount: fields.length, fieldTypes, status }));
    } catch (e) {
      failures++;
      console.log(JSON.stringify({ filename: file, error: e.message, status: 'FAIL (load error)' }));
    }
  }
  console.log(`\nSUMMARY: ${files.length} PDFs, ${failures} with zero/failed fields`);
  process.exit(failures > 0 ? 1 : 0);
})();
