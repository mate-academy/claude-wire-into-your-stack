---
description: Review a route file against the project's conventions and docs/api.md
argument-hint: <route file, e.g. routes/users.js>
allowed-tools: Read, Grep, Glob, Bash(npm test), Bash(npm run lint), mcp__docs__read_text_file
---

Review the route file `$ARGUMENTS` (default to every file in `routes/` if no file was given) against this project's conventions. Read the file, `db/store.js`, the matching test file in `tests/`, and `docs/api.md` before judging anything.

Check each handler for:

1. **Data access**: all reads and writes go through `db/store.js` helpers; the route holds no state.
2. **Validation**: bad or missing input returns `400` *before* the store is called; a missing record returns `404`; input that is present but the wrong type (e.g. a number for `name`) is treated as invalid.
3. **Error shape**: every error response is exactly `{ "error": "message" }` JSON. Look for any `res.send`, plain-text or differently shaped errors.
4. **Status codes**: `200` for reads and updates, `201` for creates, `204` for deletes; every response is `return`ed.
5. **Tests**: each status code the handler can return has a test in `tests/`, and the test file uses `store.reset()` in `beforeEach`.
6. **Docs drift**: `docs/api.md` describes this endpoint and matches what the code actually does: method, path, body fields and every status code.

Then run `npm run lint` and `npm test` and include the results.

Report as a short list grouped by handler (`METHOD /path`). For each finding, give `file:line`, what's wrong, and the fix. End with a one-line verdict: **ready** or **needs changes**. Do not edit any files; this command only reviews.
