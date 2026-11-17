---
description: Review a route file against this API's conventions (store access, 400/404, error shape, tests, docs)
argument-hint: <route file, e.g. routes/users.js>
allowed-tools: Read, Grep, Glob
---

Review the route file `$ARGUMENTS` against this project's conventions. This is read-only: report findings and do not edit any files.

If `$ARGUMENTS` is empty, review every file in `routes/`.

Read the route file first, then `server.js`, `db/store.js`, the matching `tests/<resource>.test.js` and `docs/api.md`. Check each item below for every handler in the file:

1. **Data access**: All reads and writes go through `db/store.js` helpers. Flag any state the route holds itself, such as module-level arrays or counters, and any direct changes to records the store returned.
2. **Input validation**: Required body fields are checked in the route, and a missing one returns `400`. A partial update returns `400` when no updatable field was sent. Ids are converted with `Number(req.params.id)`.
3. **Missing records**: A lookup, update or delete that the store answers with `undefined` returns `404`.
4. **Error shape**: Every error response is `res.status(code).json({ error: 'message' })`. Flag `res.send`, plain-text errors, other JSON shapes, and error responses with no status code.
5. **Status codes**: POST returns `201` with the created record, GET and PUT return `200`, and DELETE returns `204`.
6. **Control flow**: Every response inside a branch is `return`ed, so no code runs after a response is sent.
7. **Mounting**: The router is required and mounted in `server.js` under its resource's base path.
8. **Tests**: `tests/<resource>.test.js` has a test for each handler's success case and for each of its `400`/`404` branches, and resets the store with `store.reset()` in `beforeEach`.
9. **Docs**: `docs/api.md` has a `### METHOD /path` entry for each handler, and the documented status codes match the code.
10. **Comments**: Each handler has a one-line `// METHOD /path — description.` comment above it.

Format the report like this:

- A table with one row per handler (method + path) and one column per check, marked ✅ (pass), ❌ (fail) or — (not applicable).
- Under the table, a numbered list of each ❌ finding with its `file:line`, what's wrong, and the concrete fix.
- A final line saying either "No issues found." or "N issues found."
