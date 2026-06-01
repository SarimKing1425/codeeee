#!/usr/bin/env node
/**
 * build-docspring-workflow.js
 *
 * Takes the existing workflow-v5.json and produces workflow-docspring.json
 * by swapping the render.com PDF nodes for DocSpring API calls and removing
 * the Anvil KEY_MAPS from Prep Payload.
 *
 * Run once: `node build-docspring-workflow.js`
 * Output:  `workflow-docspring.json`
 */
const fs = require('fs');
const path = require('path');

const src = JSON.parse(fs.readFileSync(path.join(__dirname, 'workflow-v5.json'), 'utf8'));
const out = JSON.parse(JSON.stringify(src));

const AIRTABLE_BASE = 'appboF9L8CJ3mGx7f';
const FORM_TEMPLATES_TABLE = 'tblZB8Nfl3LCUFL22';
const CALL_LOG_TABLE = 'tblsAKvBTKmDQjOQr';
const DOCSPRING_TEMPLATE_ID_FIELD = 'DocSpring Template ID';
const FORM_NAME_FIELD = 'Form Name';

const findNode = (name) => out.nodes.find((n) => n.name === name);

// ─── 1) Slim down "Prep Payload" — remove the 1500-line KEY_MAPS ─────────────
const prep = findNode('Prep Payload');
prep.parameters.jsCode = `// DocSpring version — KEY_MAPS removed. DocSpring uses semantic keys directly.
// This node:
//   - normalizes the incoming VAPI webhook body
//   - resolves which form was being filled
//   - extracts {kyrieFieldKey: rawAnswer} captured during the call
//   - emits { recordId, formName, callId, fromNumber, rawAnswers } for GPT

const body = $input.first().json.body || $input.first().json;

// Pull what the post-call processor put into the Call Log row
const recordId = body.recordId || body.callLogRecordId;
const formName = body.formName || body.formTemplate || body['Form Name'];
const callId = body.callId || body.vapiCallId || body['VAPI Call ID'];
const fromNumber = body.fromNumber || body.clientPhone || body['Client Phone'];

// rawAnswers can come in as either JSON string or already-parsed object
let rawAnswers = body.rawAnswers || body['Form Answers (JSON)'] || {};
if (typeof rawAnswers === 'string') {
  try { rawAnswers = JSON.parse(rawAnswers); } catch { rawAnswers = {}; }
}

if (!formName) throw new Error('Prep Payload: missing formName');
if (!recordId) throw new Error('Prep Payload: missing Call Log recordId');

return [{
  json: {
    recordId,
    formName,
    callId,
    fromNumber,
    rawAnswers,
  },
}];`;

// ─── 2) Update GPT Translator prompt — now outputs semantic keys directly ────
const gpt = findNode('GPT Translator');
const newGptBody = {
  model: 'gpt-4o-mini',
  temperature: 0.1,
  response_format: { type: 'json_object' },
  messages: [
    {
      role: 'system',
      content:
        'You map call-captured intake answers into a CANONICAL semantic key format for filling a US legal-intake PDF via DocSpring.\n\n' +
        'You receive:\n' +
        '- formName: which legal form is being filled.\n' +
        '- validFieldKeys: the COMPLETE list of semantic keys for this form (snake_case, e.g. petitioner_full_legal_name, marriage_date, total_years_married). Only these keys are valid output.\n' +
        '- rawAnswers: {kyrieQuestionKey: callerAnswer} captured during the call.\n\n' +
        'Output a single JSON object whose keys are EXCLUSIVELY drawn from validFieldKeys and whose values are the appropriate value for that key.\n\n' +
        'Rules:\n' +
        '- Never invent keys. Only use keys present in validFieldKeys.\n' +
        '- For an address like "1234 Main St, Sacramento, CA 95814", parse into separate _street, _city, _state, _zip keys when those exist for that party.\n' +
        '- For dates, output YYYY-MM-DD.\n' +
        '- For derived keys (todays_date, *_age, total_years_married), compute them from the available data.\n' +
        "- For checkbox/radio_group fields (keys with `__option` suffix), output true for the chosen option(s) and omit the others.\n" +
        '- If a key has no usable answer, omit it (do not output null or empty string).\n' +
        '- Output JSON only.',
    },
    {
      role: 'user',
      content:
        'formName: {{ $json.formName }}\n\n' +
        'validFieldKeys (one per line):\n{{ $node["Get Template Meta"].json.fields.fieldKeysParsed.join("\\n") }}\n\n' +
        'rawAnswers:\n{{ JSON.stringify($json.rawAnswers, null, 2) }}',
    },
  ],
};
gpt.parameters.jsonBody = `={{ JSON.stringify(${JSON.stringify(newGptBody)
  .replace(/"\{\{ \$json\.formName \}\}"/g, '$json.formName')
  .replace(/"\{\{ \$node\[\\"Get Template Meta\\"\]\.json\.fields\.fieldKeysParsed\.join\(\\\\\"\\\\n\\\\\"\)\\\\n\}\}"/g, '($node["Get Template Meta"].json.fields.fieldKeysParsed || []).join("\\n")')
  .replace(/"\{\{ JSON\.stringify\(\$json\.rawAnswers, null, 2\) \}\}"/g, 'JSON.stringify($json.rawAnswers, null, 2)')}) }}`;
// Simpler: write the body directly without trying to escape the template
gpt.parameters.jsonBody = `={{ JSON.stringify({
  model: "gpt-4o-mini",
  temperature: 0.1,
  response_format: { type: "json_object" },
  messages: [
    {
      role: "system",
      content: "You map call-captured intake answers into a CANONICAL semantic key format for filling a US legal-intake PDF via DocSpring.\\n\\nYou receive: formName, validFieldKeys (the COMPLETE list of semantic keys for this form), rawAnswers ({kyrieKey: callerAnswer} captured during the call).\\n\\nOutput a single JSON object whose keys are EXCLUSIVELY drawn from validFieldKeys and whose values are the appropriate value for that key.\\n\\nRules:\\n- Never invent keys. Only use keys present in validFieldKeys.\\n- For an address like '1234 Main St, Sacramento, CA 95814', parse into separate _street/_city/_state/_zip keys when those exist for that party.\\n- For dates, output YYYY-MM-DD.\\n- For derived keys (todays_date, *_age, total_years_married), compute them from the available data.\\n- For checkbox/radio_group fields (keys with __option suffix), output true for the chosen option(s) and omit the others.\\n- If a key has no usable answer, omit it (do not output null or empty string).\\n- Output JSON only."
    },
    {
      role: "user",
      content: "formName: " + $json.formName + "\\n\\nvalidFieldKeys:\\n" + ($("Get Template Meta").item.json.validFieldKeys || []).join("\\n") + "\\n\\nrawAnswers:\\n" + JSON.stringify($json.rawAnswers, null, 2)
    }
  ]
}) }}`;

// ─── 3) New node: Get Template Meta (Airtable lookup) ───────────────────────
// Replaces both the static KEY_MAPS lookup and provides DocSpring Template ID.
const getTemplateMetaNode = {
  parameters: {
    method: 'GET',
    url: `=https://api.airtable.com/v0/${AIRTABLE_BASE}/${FORM_TEMPLATES_TABLE}`,
    sendQuery: true,
    queryParameters: {
      parameters: [
        { name: 'filterByFormula', value: `={{"{Form Name}=\\"" + $json.formName + "\\""}}` },
        { name: 'maxRecords', value: '1' },
        { name: 'fields[]', value: 'DocSpring Template ID' },
        { name: 'fields[]', value: 'Field Keys' },
        { name: 'fields[]', value: 'Form Name' },
      ],
    },
    sendHeaders: true,
    headerParameters: {
      parameters: [
        { name: 'Authorization', value: 'Bearer YOUR_AIRTABLE_PAT' },
      ],
    },
    options: {},
  },
  id: 'get-template-meta-node',
  name: 'Get Template Meta',
  type: 'n8n-nodes-base.httpRequest',
  typeVersion: 4.2,
  position: [600, 200],
  notes:
    'Looks up the DocSpring Template ID and the canonical Field Keys for the form being filled. ' +
    'Replaces the 1500-line static KEY_MAPS that used to live in Prep Payload.',
};
out.nodes.push(getTemplateMetaNode);

// Parse the Field Keys multiline text into an array on the same node response —
// easier to do via a tiny Code node so subsequent nodes can use it cleanly.
const parseKeysNode = {
  parameters: {
    jsCode: `// Parse "Field Keys" multilineText into a clean array of semantic keys.
// The column stores entries one-per-line as "snake_case_key | Human Label".
// We only want the keys (the left of the |), and skip section headers (# ...).

const at = $input.first().json;
const record = (at.records || [])[0];
if (!record) throw new Error('Get Template Meta: no Airtable row matched formName "' + $("Prep Payload").item.json.formName + '"');

const templateId = record.fields['DocSpring Template ID'];
if (!templateId) throw new Error('Form Templates row has no DocSpring Template ID set yet — upload + map the form in DocSpring first.');

const raw = record.fields['Field Keys'] || '';
const validFieldKeys = raw
  .split(/\\r?\\n/)
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'))
  .map((l) => l.split('|')[0].trim())
  .filter(Boolean);

return [{
  json: {
    docSpringTemplateId: templateId,
    validFieldKeys,
    formName: record.fields['Form Name'],
  }
}];`,
  },
  id: 'parse-template-meta-node',
  name: 'Parse Template Meta',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [800, 200],
};
out.nodes.push(parseKeysNode);

// ─── 4) Replace "Fill PDF" with DocSpring submit ────────────────────────────
const fillPdf = findNode('Fill PDF');
fillPdf.name = 'DocSpring Submit';
fillPdf.parameters = {
  method: 'POST',
  url:
    '=https://api.docspring.com/api/v1/templates/' +
    "{{ $node[\"Parse Template Meta\"].json.docSpringTemplateId }}" +
    '/submissions?wait=true',
  authentication: 'genericCredentialType',
  genericAuthType: 'httpBasicAuth',
  sendHeaders: true,
  headerParameters: {
    parameters: [
      { name: 'Content-Type', value: 'application/json' },
    ],
  },
  sendBody: true,
  specifyBody: 'json',
  jsonBody:
    "={{ JSON.stringify({ data: JSON.parse($json.choices[0].message.content), test: false, metadata: { callId: $(\"Prep Payload\").item.json.callId, formName: $(\"Prep Payload\").item.json.formName, callLogRecordId: $(\"Prep Payload\").item.json.recordId } }) }}",
  options: { timeout: 120000 },
};
fillPdf.notes =
  'POSTs collected answers to DocSpring. wait=true blocks until the PDF is rendered, ' +
  'so the response includes the download_url directly. ' +
  'Auth: configure an HTTP Basic Auth credential named "DocSpring API" with Token ID as user, Token Secret as password.';

// ─── 5) Replace "Download Filled PDF" with DocSpring's download_url ─────────
const downloadPdf = findNode('Download Filled PDF');
downloadPdf.parameters.url = '={{ $node["DocSpring Submit"].json.submission.download_url }}';

// ─── 6) Update "Update Call Log" to reference DocSpring URL ─────────────────
const updateLog = findNode('Update Call Log');
updateLog.parameters.jsonBody =
  "={{ JSON.stringify({ typecast: true, fields: { \"PDF Status\": \"Done\", \"PDF Link\": $node[\"DocSpring Submit\"].json.submission.download_url, \"Completed PDF\": [ { url: $node[\"DocSpring Submit\"].json.submission.download_url } ] } }) }}";

// ─── 7) Update "Append PDF to Client" similarly ─────────────────────────────
const appendPdf = findNode('Append PDF to Client');
if (appendPdf && appendPdf.parameters && appendPdf.parameters.jsonBody) {
  appendPdf.parameters.jsonBody = appendPdf.parameters.jsonBody
    .replace(/\$\("Fill PDF"\)\.item\.json\.url/g, '$node["DocSpring Submit"].json.submission.download_url')
    .replace(/Fill PDF/g, 'DocSpring Submit');
}

// ─── 8) Re-wire the connections to insert the new nodes ─────────────────────
const conns = out.connections;
// New order: Webhook → Prep Payload → Get Template Meta → Parse Template Meta → GPT Translator → DocSpring Submit → (Download Filled PDF | Update Call Log) → ...

conns['Prep Payload'] = { main: [[{ node: 'Get Template Meta', type: 'main', index: 0 }]] };
conns['Get Template Meta'] = { main: [[{ node: 'Parse Template Meta', type: 'main', index: 0 }]] };
conns['Parse Template Meta'] = { main: [[{ node: 'GPT Translator', type: 'main', index: 0 }]] };
conns['GPT Translator'] = { main: [[{ node: 'DocSpring Submit', type: 'main', index: 0 }]] };
conns['DocSpring Submit'] = {
  main: [[
    { node: 'Download Filled PDF', type: 'main', index: 0 },
    { node: 'Update Call Log', type: 'main', index: 0 },
  ]],
};
// Keep existing downstream connections from Download Filled PDF, Update Call Log, etc.
// (they were already correct in v5)
// Drop the now-obsolete "Fill PDF" name from connections object:
delete conns['Fill PDF'];

// ─── 9) Workflow metadata ───────────────────────────────────────────────────
out.name = (out.name || 'Kyrie PDF Workflow') + ' (DocSpring)';

const outPath = path.join(__dirname, 'workflow-docspring.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log('Wrote', outPath);
console.log('Nodes:', out.nodes.length, '| Renamed Fill PDF → DocSpring Submit, added Get/Parse Template Meta.');
