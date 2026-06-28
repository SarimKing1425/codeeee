# Client screenshots — one folder per client

Source screenshots for the case-study decks live here, **one subfolder per client**:

```
images/
  <client>/            e.g. leshawn/
    superbowl-hero.png
    vapi-1.png
    vapi-2.png
    vapi-3.png
    website-chatbot.png
```

Notes:
- These are the **cropped, cleaned** versions (sidebars / account names / black redaction
  bars removed). Keep originals out of the repo.
- The finished decks **embed these as base64**, so the HTML does not depend on this folder
  at delivery time. The folder is the editable source of truth if you need to re-frame.
- When de-embedding a deck to edit it, its image paths are `images/<client>/<name>.png`.
- New client? Make `images/<newclient>/` and drop their cleaned screenshots in.

Current: `leshawn/` — Superbowl UK case study.
