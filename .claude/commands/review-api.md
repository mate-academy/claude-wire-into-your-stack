---
description: Review changes against this project's API conventions
---

Review the current staged/unstaged diff — or the path in $ARGUMENTS if one is
given — against this project's conventions:

- one route file per resource, mounted in `server.js` under its base path
- all data access goes through `db/store.js`; routes hold no state
- input validated in the route: `400` on bad input, `404` on a missing record
- every error response is JSON shaped `{ "error": "message" }`
- status codes: `201` create, `200` read/update, `204` delete
- tests use `node:test` + `supertest` with `store.reset()` in `beforeEach`
- `npm run lint` and `npm test` pass

Report findings as a short checklist. For each issue give `file:line` and a
concrete fix. End with a one-line verdict: ready to commit, or not yet.
