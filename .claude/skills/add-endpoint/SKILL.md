---
name: add-endpoint
description: Required procedure for ANY task that adds, removes, or changes an API route or endpoint in this Express app (e.g. "add a DELETE /users/:id", "new route", "update the users endpoint"). Load this before writing route code.
---

# Adding or changing an endpoint

Follow these house rules so new routes match the existing ones.

1. **One router per resource.** Routes live in `routes/<resource>.js` using `express.Router()`. New resources get mounted in `server.js`.
2. **Comment every route** in the format `// METHOD /path — what it does`, matching `routes/users.js`.
3. **Only touch data through `db/store`.** Routes never hold their own data. If the store lacks a function you need, add it there.
4. **Convert IDs to numbers.** Store IDs are numbers, so always do `Number(req.params.id)` before calling the store. A string ID silently returns `undefined`.
5. **Errors are JSON with an `error` key.**
   - Missing or bad input → `400` with `{ "error": "<field> is required" }`
   - Not found → `404` with `{ "error": "<Thing> not found" }`
   - Use `return res.status(...)` so the handler stops there.
6. **Test both layers** with Node's built-in runner (`node:test` + `node:assert`), no Jest:
   - New store functions → `tests/store.test.js`
   - New routes → `tests/<resource>.test.js`, following the style of `tests/users.test.js`
   - Cover the happy path plus at least one error case (400 or 404).
7. **Finish by running `npm test` and `npm run lint`.** Don't say you're done until both pass.