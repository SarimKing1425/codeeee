// Builds a dummy fill payload for one form covering text + checkbox + radio.
// Uses only real field names + valid radio options so `unmatched` is empty.
const fs = require('fs');
const path = require('path');
const { getFields } = require('../lib/fillPdf');

const form = process.argv[2] || 'birth-certificate-correction.pdf';
const FORMS = path.join(__dirname, '..', 'forms');

(async () => {
  const fields = await getFields(fs.readFileSync(path.join(FORMS, form)));
  const data = {};
  const used = { text: 0, checkbox: 0, radio: 0 };
  for (const f of fields) {
    if (f.type === 'text') { data[f.name] = `TEST ${f.name}`.slice(0, 40); used.text++; }
    else if (f.type === 'checkbox') { data[f.name] = 'yes'; used.checkbox++; }
    else if (f.type === 'radio' && f.options && f.options.length) { data[f.name] = f.options[0]; used.radio++; }
  }
  const body = { formName: form.replace(/\.pdf$/, ''), fields: data };
  fs.writeFileSync(path.join(__dirname, 'payload.json'), JSON.stringify(body, null, 2));
  console.error(`payload for ${form}: text=${used.text} checkbox=${used.checkbox} radio=${used.radio} (total keys ${Object.keys(data).length})`);
})();
