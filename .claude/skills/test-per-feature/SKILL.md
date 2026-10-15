---
name: test-per-feature
description: This skill should be used whenever a new route, resource, or feature is added to this Express API, or an existing route gains new behavior. Triggers on "add a route", "new feature", "new resource", "add an endpoint", or before committing any change under routes/ or db/store.js.
---

# Test per feature

Every route file in `routes/` has exactly one matching test file in `tests/`, named `<resource>.test.js` (e.g. `routes/users.js` ↔ `tests/users.test.js`). No route ships without one.

## Rule

- New `routes/<resource>.js` → create `tests/<resource>.test.js` in the same change.
- New behavior added to an existing route (new field, new branch, new status code) → add a case to that route's existing test file, don't create a second file for it.
- Never mark a feature done if its route logic has no test covering it.

## Structure to follow (see `tests/users.test.js`)

- Import `node:test`, `node:assert`, `supertest`, `app` from `../server`, and `store` from `../db/store`.
- `test.beforeEach(() => store.reset())` at the top so each case starts from clean seed data.
- One `test('<METHOD> /<resource>... <behavior>', async () => { ... })` per behavior, using `request(app)` to make the call and `assert.equal`/`assert.ok` on `res.status` and `res.body`.
- Cover, per route: the happy path, each validation failure (400), and each not-found case (404) — mirroring exactly the branches present in the route file.

## Procedure

1. When writing or reviewing a route change, check whether `tests/<resource>.test.js` exists and covers every branch in the route.
2. Add missing cases or the missing file, matching the style above.
3. Run `npm test` and confirm it passes before considering the change complete.