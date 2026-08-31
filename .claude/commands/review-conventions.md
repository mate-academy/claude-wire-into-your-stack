---
description: Review the current diff against the Course API conventions checklist
argument-hint: "[optional path or 'staged' — defaults to the working-tree diff vs main]"
---

Review code against this project's conventions. Do not restyle or rewrite —
just report what does and doesn't hold, file:line, most important first.

## What to review

$ARGUMENTS

If the above is empty, review `git diff main...HEAD` plus any uncommitted
changes. If it names a path, review that file. If it is `staged`, review
`git diff --cached`.

## Checklist

1. **One route file per resource**, mounted in `server.js` under its base path
   (require with the other requires, `app.use` with the other mounts).
2. **All data access goes through `db/store.js`** — no route holds arrays, ids,
   or other state directly.
3. **Validation in the route**: `400` on bad or missing input, `404` when a
   record is not found. Create returns `201`.
4. **Error responses** are JSON in exactly the shape `{ "error": "message" }`
   with no extra keys.
5. **`:id` params** are coerced with `Number(...)` before use.
6. **Tests** mirror `tests/users.test.js` (supertest against imported `app`,
   `store.reset()` in `beforeEach`) and cover each new `400`/`404` branch.
7. **`docs/api.md`** has an entry for every new or changed endpoint.
8. `npm run lint` and `npm test` still pass.

## Output

- A short list of findings, each as `path:line — what's off — the fix`.
- Then run `npm run lint` and `npm test` and report pass/fail.
- End with a one-line verdict: ready / needs changes.
