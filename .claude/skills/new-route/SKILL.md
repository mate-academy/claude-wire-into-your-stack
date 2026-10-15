---
name: new-route
description: Use whenever someone asks to add, create, or write a new route or endpoint for this Express API (e.g. "add a DELETE /users/:id route", "create a new resource route", "write an endpoint for..."). Walks through this repo's route conventions so new routes match the existing ones.
---

# Adding a new route

This project keeps routing conventions strict and consistent (see `CLAUDE.md`). Follow these steps when adding a new route or a new resource.

1. **One file per resource.** If the resource doesn't have a router yet, create `routes/<resource>.js` following the shape of `routes/users.js`: `express.Router()`, one handler per HTTP method, `module.exports = router`.
2. **Mount it in `server.js`.** Add `const <resource>Router = require('./routes/<resource>');` and `app.use('/<resource>', <resource>Router);` next to the existing mounts.
3. **Go through `db/store.js` only.** Routes never hold state directly. Add any new data helpers (e.g. `deleteUser`, `listPosts`) to `db/store.js` and export them — don't reach into arrays/objects from inside a route file.
4. **Validate input in the route.**
   - Missing/invalid input → `res.status(400).json({ error: '...' })`
   - Record not found → `res.status(404).json({ error: '...' })`
5. **Match the existing error shape.** Every error response is `{ "error": "message" }` — no other keys.
6. **Add a test.** Follow `tests/users.test.js`'s pattern (Node's built-in test runner + supertest), covering the happy path, the 400 case, and the 404 case, and call `store.reset()` between tests if the resource shares that pattern.
7. **Lint before finishing.** Run `npm run lint` and `npm test`.
