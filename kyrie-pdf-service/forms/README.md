# forms/

Drop your 19 fillable (AcroForm) PDF court/intake forms in this folder.

These are the same fillable PDFs you already downloaded back from Anvil -
the ones with the form fields baked in. **Do not** use a flat / scanned PDF;
it has no fields and nothing can be filled.

## Naming
Name files simply, no spaces, e.g.:

```
divorce-petition.pdf
child-custody.pdf
guardianship.pdf
```

Then map each Airtable "Form Name" to its filename in `manifest.json`.

## Verify a PDF actually has fields
After deploying, hit:

```
GET /forms/divorce-petition/fields
```

- If it returns a list of ~60 field names -> good, that PDF is fillable.
- If it returns `count: 0` -> that PDF has no AcroForm fields. Re-download
  the fillable version from Anvil (the cast PDF), or it's an XFA/flat file
  that needs fields added first.
