---
description: Review a route file against the project's conventions
argument-hint: <route file, e.g. routes/users.js>
allowed-tools: Read, Grep, Glob
---

Review `$ARGUMENTS` against this project's conventions from CLAUDE.md:

- Data access goes only through `db/store.js`; the route holds no state.
- Input is validated in the route: `400` on bad input, `404` when a record is missing.
- Every error response is JSON shaped `{ "error": "message" }`.
- The router is mounted in `server.js` under its base path.
- The endpoints are documented in `docs/api.md` and covered in `tests/`.

Report each violation as `file:line - problem - suggested fix`. If everything conforms, say so in one line. Do not modify any files.
