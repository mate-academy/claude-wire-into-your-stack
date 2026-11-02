---
name: add-resource-route
description: Use when adding or changing an API resource route in this Express project, including a new /<resource> endpoint, its db/store.js helpers, its mount in server.js, or its tests. Do not use for unrelated edits such as README, lint config, or the health route.
---

# Adding a resource route

This project follows fixed conventions from CLAUDE.md. Follow them exactly.

## Steps

1. **Route file.** Create `routes/<resource>.js` (plural, lowercase, e.g. `routes/users.js`). Export an Express router:
   ```js
   const express = require('express');
   const store = require('../db/store');

   const router = express.Router();
   // handlers here
   module.exports = router;
   ```
   Put one comment above each handler describing the method, path, and behavior, matching `routes/users.js`.

2. **Data access goes through the store.** Never keep arrays, counters, or other state in a route file. Add any needed helpers to `db/store.js` (list, get, create, update, delete as needed), add them to `module.exports`, and make `reset()` cover any new state so tests stay isolated.

3. **Validate input in the route.**
   - Return `400` when required fields are missing or empty. Name the required fields in the message, e.g. `name and email are required`.
   - Return `404` when the record for `req.params.id` doesn't exist. Convert the id with `Number(req.params.id)` before calling the store.
   - Use `201` for successful creates, `200` otherwise.

4. **Error shape.** Every error response is JSON: `res.status(<code>).json({ error: '<message>' })`. No other shape.

5. **Mount in `server.js`.** Require the router near the existing ones and call `app.use('/<resource>', <resource>Router)` alongside `/health` and `/users`. Don't add routes directly on `app`.

6. **Tests.** Add `tests/<resource>.test.js` (or extend an existing file) using Node's built-in runner (`node:test`) and `supertest` against the exported app. Call `store.reset()` before each test. Cover the success path, each `400` case, and each `404` case.

7. **Verify.** Run `npm test` and `npm run lint`. Both must pass before reporting done.

## Checklist

- [ ] Router file exports an Express router, no state in the route
- [ ] Store helpers added and exported, `reset()` updated if needed
- [ ] `400` on bad input, `404` on missing record, JSON `{ error }` bodies
- [ ] Mounted in `server.js` under its base path
- [ ] Tests cover success, `400`, and `404`; `npm test` and `npm run lint` pass
