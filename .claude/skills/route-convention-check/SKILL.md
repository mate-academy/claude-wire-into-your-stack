---
name: route-convention-check
description: Verify that a newly added or modified route follows project conventions. Use when a route handler is added or changed in routes/.
---
# Route convention check

For every route touched in the current change, verify:

1. **Auth** — is the route mounted before or after `requireToken` in `server.js`?
   If it mutates data (POST/PUT/DELETE) and is after the gate, confirm it also
   has the correct inline middleware (`requireToken`, `requireAdmin`, or both).

2. **Input validation** — does the route validate `:id` params with `parseId`
   from `lib/parseId.js`? Does it use `req.body ?? {}` before destructuring?

3. **Error shape** — do all error responses follow `{ "error": "message" }`
   with the right status (400 bad input, 404 missing record)?

4. **Store access** — does the route read/write state only through `db/store.js`,
   never holding state directly?

Report each violation as a short bullet. If everything looks correct, say so in
one line and move on.
