---
description: Review a route file against this repo's conventions (CLAUDE.md)
---

Review `$ARGUMENTS` against the conventions in `CLAUDE.md`:

1. Does every handler validate its input and return `400` on bad input, `404` when a record is missing?
2. Is every error response shaped exactly `{ "error": "message" }`?
3. Does the route go through `db/store.js` only, with no state held directly in the route file?
4. Is the router mounted correctly in `server.js` under its base path?
5. Does a matching test file exist under `tests/` covering the happy path, the 400 case, and the 404 case?

Report findings as a short list: what's fine, what's missing, and the exact line(s) to fix. Don't rewrite the file unless asked.
