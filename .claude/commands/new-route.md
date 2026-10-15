---
description: Scaffold a new resource route end to end — store helpers, router, mount, tests and docs — following this project's conventions.
argument-hint: <resource-plural> [required,fields]
allowed-tools: Read, Glob, Grep, Edit, Write, Bash(npm test:*), Bash(npm run lint:*)
---

# Scaffold a new route

Resource: **$1**
Required fields for create: **$2**

If `$1` is missing, stop and ask for the resource name instead of guessing.
If `$2` is empty, default to `name` and say so.

`$1` is the plural, lowercase resource name used in the URL and filenames
(`posts`). Derive the singular form for messages and comments (`Post`).

Follow `routes/users.js`, `db/store.js` and `tests/users.test.js` as the
reference implementation — read them first and copy their structure rather than
inventing a new one.

## Steps

1. **Store helpers** — add to `db/store.js`, alongside the user helpers:
   `list$1`, `get$1`, `create$1`, `update$1`, following the existing naming and
   shape. Extend `seed()` with two plausible seed records and make `reset()`
   cover them. Keep the module's single `nextId` pattern per collection.
   No route may hold state directly — all data access goes through this file.

2. **Router** — create `routes/$1.js` exporting an Express router with:
   - `GET /` — list all
   - `GET /:id` — one record, or `404`
   - `POST /` — create; requires the fields in `$2`; returns `201`
   - `PUT /:id` — update; at least one field required; `404` if absent
   Match the comment style of `routes/users.js` (one short `//` line per route).

3. **Mount it** — in `server.js`, require the router and add
   `app.use('/$1', $1Router);` next to the existing mounts.

4. **Tests** — create `tests/$1.test.js` in the style of `tests/users.test.js`:
   `node:test` + `node:assert` + `supertest`, `test.beforeEach(() => store.reset())`,
   and one test per branch including **every** error branch.

5. **Docs** — add a `## $1` section to `docs/api.md` matching the existing
   layout: the record shape, then one entry per endpoint with its status codes.

6. **Verify** — run `npm test` and `npm run lint`. Report the actual output.
   Do not claim success unless both pass.

## Error responses

Do not improvise error bodies, status codes or wording. Use the
`error-responses` skill — the `{ "error": "message" }` shape, `400` for invalid
input, `404` for a missing record, and the message templates
(`$1 not found` in singular capitalised form, `<a> and <b> are required`,
`<a> or <b> is required`).

## Report

When finished, list the files created or changed, the endpoints added, and the
test/lint results.
