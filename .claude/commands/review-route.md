---
description: Review one route file against this project's checklist
argument-hint: <route file, e.g. routes/users.js>
---

Review `$ARGUMENTS` against this project's checklist and report findings as a short list (file:line — problem — fix). Do not edit any files.

Checklist:
- every handler goes through `db/store.js` and holds no state of its own
- input is validated first, bad input returns `400` with `{ "error": "..." }`
- a missing record returns `404` with `{ "error": "..." }`, never crashes
- each handler has a `// METHOD /path — ...` comment
- every endpoint in the file is documented in `docs/api.md`
- `tests/` covers the success, 400 and 404 cases

End with one line: "Ready to merge" or "Needs changes".
