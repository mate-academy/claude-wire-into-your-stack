---
argument-hint: [path/to/route.js] (optional; defaults to all files in routes/)
description: Review a route file against this repo's API route conventions
---

Review the route file(s) below against this repo's conventions.

## Target

- If `$ARGUMENTS` is non-empty, review exactly that file: `$ARGUMENTS`
- If `$ARGUMENTS` is empty, review every file in `routes/`.

## What to check

For each route file, verify:

1. **Mounted correctly** — the file creates a router with `express.Router()`,
   exports it with `module.exports = router`, and is mounted in `server.js` with
   `app.use('<base path>', <router>)`. The base path lives only in `server.js`;
   handlers use paths relative to it (`'/'`, `'/:id'`). Flag a router that is
   defined but never mounted, or a handler that repeats the base path.

2. **Data access through `db/store.js`** — handlers never touch module-level
   state or a raw array directly; every read and write goes through a helper
   exported from `db/store.js`. If a handler needs an operation the store does
   not expose, that logic belongs in `db/store.js`, not the route. Check that ids
   from `req.params` are converted with `Number(...)` before being passed to the
   store.

3. **Correct status codes** —
   - `400` when the request body is invalid or missing required fields
   - `404` when the addressed record does not exist (the store helper returns
     `undefined`), checked before any further work
   - `200` for successful reads and updates, `201` for creates, `204` for a
     successful delete with no body
   - error paths use `return res.status(...)...` so the handler stops

4. **Correct error shape** — every error response is JSON of the form
   `{ "error": "message" }`: a single `error` key whose value is a
   human-readable string that names what was wrong.

## Output

For each file, report:

- a one-line verdict (`OK` or `needs changes`)
- a bullet list of any violations, each citing `file:line` and naming which
  convention is broken and the fix

End with a short overall summary. Do not modify any files.
