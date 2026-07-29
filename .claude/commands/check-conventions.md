---
description: Review the current branch's changes against this repo's route/API conventions checklist before commit or PR.
---

Review the changes on this branch for compliance with this repo's conventions (see CLAUDE.md).

Base ref: $ARGUMENTS — if empty, use `main`.

1. Run `git diff <base ref>...HEAD` to see what changed (fall back to plain `git diff` if there's no committed history yet, e.g. uncommitted work only).
2. For every changed or added route, check each of these, one by one:
   - **Router pattern** — one file per resource in `routes/`, exports `express.Router()`, mounted in `server.js` under its base path.
   - **Store access** — all data access goes through `db/store.js`; the route never holds state directly.
   - **Validation** — input is validated in the route handler; `400` on bad input, `404` when a record is missing.
   - **Error shape** — every error response is `res.status(code).json({ error: 'message' })`, no other shape.
   - **Docs** — `docs/api.md` is updated to match any new or changed endpoint.
   - **Tests** — `tests/` has coverage for the happy path and the error paths, following the `tests/users.test.js` pattern (`node:test` + `supertest`, `test.beforeEach(() => store.reset())`).
3. Report a pass/fail line per convention per changed file, citing `file:line` for anything that violates a convention. If everything passes, say so plainly — don't invent problems that aren't there.
