---
description: Review a route file against this repo's API conventions checklist
---

Review `$ARGUMENTS` against the conventions in `CLAUDE.md`. For each handler in the file, check:

- [ ] Data access goes through `db/store.js` — no direct state mutation in the route
- [ ] Required input is validated; missing/bad input returns `400` with `{ "error": "message" }`
- [ ] A missing record returns `404` with `{ "error": "message" }`
- [ ] Success responses use the right status (`201` for creates, `200`/default for the rest)
- [ ] The router is mounted in `server.js` under the right base path
- [ ] There's a matching test in `tests/` covering the success path and each error case
- [ ] `docs/api.md` documents the endpoint and matches its actual behavior

Report the results as a checklist with ✅/❌ per item, citing file:line for anything that fails, and stop there — don't fix anything yet unless asked.
