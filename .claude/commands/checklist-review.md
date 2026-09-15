---
description: Review code against the conventions in CLAUDE.md and list fixes for anything that doesn't match
---

Review the codebase (or, if a diff/PR/set of files is specified in `$ARGUMENTS`, just that scope) against the conventions documented in `CLAUDE.md`. Check specifically for:

- **Route organization**: one route file per resource in `routes/`, mounted in `server.js` under its base path
- **Data access**: all data access goes through `db/store.js` — routes never hold state directly
- **Input validation**: routes validate input and return `400` on bad input, `404` when a record is missing
- **Error shape**: error responses are JSON in the exact shape `{ "error": "message" }`

For each convention, inspect the relevant files (`server.js`, everything in `routes/`, `db/store.js`) and note any violations.

Target: $ARGUMENTS (if empty, review the whole codebase)

Output a checklist grouped by convention. For each violation found, give:
- The file and line number
- What's wrong
- The specific fix needed to bring it into line with CLAUDE.md

If a convention is fully satisfied, mark it as passing rather than omitting it.
