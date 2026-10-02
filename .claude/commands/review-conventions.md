---
description: Review the current diff against this project's conventions from CLAUDE.md
---

Run `git diff` (and `git diff --staged`) to see the pending changes. Review them against this project's conventions:

- one route file per resource, mounted in `server.js`
- all data access goes through `db/store.js` — routes never hold state directly
- `400` on bad input, `404` when a record is missing
- error responses are JSON in the shape `{ "error": "message" }`

Focus area (optional, may be blank): $ARGUMENTS

List any violations found, with file and line, and suggest the fix for each. If everything already follows convention, say so plainly instead of inventing issues.
