---
description: Review a diff against this repo's route/store/error conventions from CLAUDE.md
---

Review the changes in `$ARGUMENTS` against this project's conventions (see CLAUDE.md). If `$ARGUMENTS` is empty, review the current uncommitted changes (`git diff HEAD`) instead.

Check each of these, one at a time, and cite the file and line for every violation:

1. **One route file per resource**, mounted in `server.js` under its base path.
2. **No state held in route files** — all reads/writes go through `db/store.js`.
3. **Input validated in the route**: `400` with `{ "error": "message" }` for bad input, `404` with `{ "error": "message" }` for a missing record.
4. **Error response shape** is always `{ "error": "message" }`.
5. **Tests exist** for any new route (happy path, `400`, `404`) and `npm run lint` / `npm test` pass.
6. **`docs/api.md`** is updated for any new or changed endpoint.

Report a short pass/fail checklist. For anything that fails, give the specific fix needed — don't just describe the problem.
