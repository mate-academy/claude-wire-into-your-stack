---
description: Scaffold a new resource route (router file, store helpers, mount in server.js, docs entry, test file) following this project's conventions.
---

Scaffold a new resource called `$ARGUMENTS` for this Express API, following
`.claude/skills/express-route-conventions/SKILL.md` exactly:

1. Add `routes/$ARGUMENTS.js` exporting an `express.Router()` with `GET /`,
   `GET /:id`, and `POST /` handlers (`400` on missing required fields, `404`
   when a record is missing, `{"error": "message"}` error shape).
2. Add the matching CRUD helpers to `db/store.js` (list/get/create), following
   the existing `users` helpers as the pattern, and include them in the
   `reset()` seed data if a fresh resource needs seed data to test against.
3. Mount the new router in `server.js` under `/$ARGUMENTS`.
4. Add a `## $ARGUMENTS` section to `docs/api.md` documenting each endpoint,
   in the same style as the existing `## Users` section.
5. Add `tests/$ARGUMENTS.test.js` with `node:test` + `supertest`, calling
   `store.reset()` in `test.beforeEach`, covering the list/get/create/404
   cases the way `tests/users.test.js` does.

Run `npm test` at the end and report the result. Don't touch the existing
`users` or `health` routes.
