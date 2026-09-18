---
description: Review a route (or all routes) against this repo's conventions checklist
argument-hint: [resource name, e.g. users — omit to check every route]
---

Review $ARGUMENTS against this repo's route conventions.

If an argument names a resource (e.g. `users`), review only `routes/$ARGUMENTS.js`, its matching `tests/$ARGUMENTS.test.js`, and its section in `docs/api.md`. If no argument was given, review every file in `routes/` and its matching test file and docs section.

For each route handler, check:
- [ ] Input is validated in the route (not in `db/store.js`); missing/invalid input returns `400`, a missing record returns `404`
- [ ] Errors are JSON in the shape `{ "error": "message" }` — never a bare string or a different key
- [ ] Successful creates return `201` with the created resource; other successful reads/updates return `200`
- [ ] Data access goes only through `db/store.js` helpers — no route holds state directly
- [ ] A one-line `// METHOD /path — description.` comment sits directly above the handler
- [ ] A matching test file exists covering the happy path, a `404`, and a `400` where applicable, using `node:test` + `supertest` with `test.beforeEach(() => store.reset())`
- [ ] `docs/api.md` has a `### METHOD /path` entry describing behavior and response codes

Report findings as a short checklist per route — pass/fail per item, with `file:line` for anything failing. Don't rewrite code, just report.
