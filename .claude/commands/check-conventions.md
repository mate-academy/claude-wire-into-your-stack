---
description: Check the working changes against the Course API conventions in CLAUDE.md
argument-hint: "[path, commit range, or 'staged' — defaults to the unstaged working diff]"
---

Review the changes for compliance with this project's conventions. Target:
**$ARGUMENTS** (when empty, review the unstaged working diff).

Diff under review:

```
!git --no-pager diff $ARGUMENTS
```

Also list the changed files for context:

```
!git --no-pager diff --stat $ARGUMENTS
```

Check each of these and report every violation as `file:line — problem — fix`:

1. **Routing** — each resource has one file in `routes/`, exports an
   `express.Router()`, and is mounted in `server.js` under its base path
   only. No route logic in `server.js`.
2. **State** — all reads/writes go through `db/store.js`. No route or module
   holds data directly.
3. **Validation** — input is checked in the route: `400` for bad/missing
   input, `404` for an unknown id. Ids are `Number(req.params.id)`.
4. **Error shape** — every error response is `res.status(code).json({ error:
   '...' })`. Flag bare strings, other key names, or non-JSON errors.
5. **Tests** — every route change has a matching case in `tests/` using
   `node:test` + `supertest`, with `store.reset()` in `beforeEach`.
6. **Docs** — new or changed endpoints are reflected in `docs/api.md`.
7. **Lint/format** — nothing that `npm run lint` would reject.

End with a single line: `RESULT: PASS` if nothing above is violated, or
`RESULT: FAIL (<n> issues)` otherwise.
