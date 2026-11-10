---
name: api-review
description: Review or audit an Express API route in this repository against the project's route conventions (route structure, input validation, status codes, JSON error shape, and db/store.js access). Use when asked to review, audit, check, or critique a file in routes/ or a specific endpoint such as POST /users. Do not use for writing new routes, fixing bugs, running tests, linting, or reviewing non-route code.
---

# API route review

Audit Express routes in this repo against the conventions in `CLAUDE.md` and the patterns already established in `routes/users.js` and `db/store.js`. This is a read-only review: report findings, do not change code.

## Scope

Review the route file or endpoint the user names. If none is named, review every file in `routes/`. Read these first:

1. `CLAUDE.md`: the documented conventions (source of truth)
2. The route file(s) under review
3. `db/store.js`: to confirm which helpers exist and what they return
4. `server.js`: to confirm the router is mounted under its base path

## What to check

### 1. Route structure
- One router per resource, one file per resource in `routes/`, exported with `module.exports = router`
- Router is mounted in `server.js` under its base path
- Paths inside the file are relative to the mount point (`'/'`, `'/:id'`), not `/users/...`
- Each handler has a `// METHOD /path — description` comment
- Handlers return early: every `res.*` call in a branch is `return`ed
- Route ids are converted with `Number(req.params.id)` before reaching the store

### 2. Input validation
- Validation happens in the route, not in the store
- Bad input returns `400`
- Required fields are checked consistently
- **Compare handlers within the same file.** Flag any difference in how equivalent input is treated. Known example: POST rejects falsy `name`/`email` (so `""` is rejected) while PUT only checks `=== undefined` (so `""` is accepted). Report such mismatches as inconsistencies, and say which handler diverges from which.
- Note missing checks (non-numeric `:id`, email format, field types) as lower-severity observations, not violations, unless `CLAUDE.md` requires them

### 3. HTTP status codes
- `200` for successful reads and updates
- `201` for successful creates
- `400` for bad input
- `404` when a record is missing
- No success status on an error path, and no error status on a success path

### 4. JSON response formats
- Errors are exactly `{ "error": "message" }`: JSON, a single `error` key, a string message
- Success responses are the bare resource (object or array), no envelope, consistent across handlers
- Message wording is consistent with existing routes (for example `'User not found'`, `'name and email are required'`)
- No plain-text or HTML responses, no `res.send` of non-JSON

### 5. Data access
- Every read and write goes through `db/store.js` helpers
- Routes hold no state of their own (no module-level arrays, counters, or caches)
- Routes only call helpers the store actually exports
- A missing record is detected from the store's `undefined` return and turned into a `404` in the route

## Severity

- **High**: breaks a documented `CLAUDE.md` convention in a way that changes behavior (wrong status code, error not in `{ "error": ... }` shape, route holding state, bypassing `db/store.js`, missing required validation)
- **Medium**: inconsistency between handlers or routes that can surprise clients (POST vs PUT validation differences, inconsistent message wording, missing early `return`)
- **Low**: style or hardening gaps that do not break a documented convention (missing handler comment, no `:id` or email format check)

## Report format

Start with a one-line summary: files reviewed and finding counts by severity. Then list findings ordered High, Medium, Low. Use this shape for each:

```
[SEVERITY] Short title
Location: path/to/file.js:LINE
Convention: which CLAUDE.md rule or existing pattern it relates to
Problem: what the code does and why it is a problem
Suggested fix: the specific change, as a short code snippet if useful
```

Rules for the report:
- Always cite `file:line`; read the file to get real line numbers, never guess
- For inconsistencies, cite both locations (for example `routes/users.js:23` and `routes/users.js:33`)
- Only report issues you verified in the code; if something could not be checked, say so
- If a route follows all conventions, say so explicitly instead of inventing findings
- End with a short list of what was checked and found compliant

## Constraints

- **Never modify application code**: no edits to routes, the store, tests, or config while reviewing. Suggested fixes appear in the report only.
- Apply fixes only if the user explicitly asks for them in a follow-up request.
- Do not run or change tests, linting, or git state as part of the review.
- Do not use this skill for creating new routes, debugging runtime errors, performance work, or reviewing code outside `routes/` and its store usage.
