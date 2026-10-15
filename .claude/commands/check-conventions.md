---
description: Review a diff against this project's route/store/error conventions from CLAUDE.md
---

Review the following against this project's conventions (see `CLAUDE.md`):

- If arguments were given (`$ARGUMENTS`), scope the review to those files/paths.
- Otherwise, review `git diff` and `git diff --staged` for all changes not yet on `main`.

For each changed route or store file, check:

1. **One route file per resource**, mounted in `server.js` under its base path.
2. **All data access goes through `db/store.js`** — routes must not hold or mutate state
   directly.
3. **Input validation**: routes return `400` on bad/missing input, `404` when a referenced
   record doesn't exist.
4. **Error shape**: every error response is JSON `{ "error": "message" }` — no bare strings,
   no other key names.
5. **Tests**: if a route's behavior changed, `tests/` has a matching test for the new
   behavior (happy path, 400 case, 404 case as applicable).
6. **Docs**: if an endpoint was added or changed, `docs/api.md` reflects it.

Report findings as a short list: file, line (if applicable), which convention it violates,
and a suggested fix. If nothing violates the conventions, say so explicitly rather than
inventing issues.
