---
description: Review the current uncommitted changes against this project's conventions
---

Review the working tree's uncommitted changes (`git diff` and `git diff --staged`) against this project's conventions from `CLAUDE.md`:

- one route file per resource, mounted in `server.js` under its base path
- all data access goes through `db/store.js` — routes never hold state directly
- input is validated in the route: `400` on bad input, `404` when a record is missing
- error responses are JSON in the shape `{ "error": "message" }`
- `docs/api.md` documents every route the same way it documents `/users`

If arguments are given, scope the review to those files/paths instead of the whole diff: $ARGUMENTS

For each convention, report pass or a specific violation with the file and line. Then run `npm test` and `npm run lint` and report their results. Finish with a short verdict: ready to commit, or what to fix first.
