---
description: Review the current diff against this project's conventions (routes, store access, error shape) and flag any deviations.
---

Review the uncommitted changes (`git diff` and `git diff --staged`) against this project's conventions from `CLAUDE.md`:

- one route file per resource, mounted in `server.js` under its base path
- all data access goes through `db/store.js` — routes never hold state directly
- input is validated in the route: `400` on bad input, `404` when a record is missing
- error responses are JSON in the shape `{ "error": "message" }`

$ARGUMENTS

For each changed file, note any deviation from these conventions with the file and line. If a file follows convention, don't comment on it. If everything follows convention, say so in one line. Don't rewrite the code — report findings only.
