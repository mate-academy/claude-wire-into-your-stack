---
name: add-route
description: Use when adding a brand-new resource/endpoint to this Express API (course-api) — e.g. "add a /products route", "create a new resource for orders", "scaffold a CRUD endpoint for X". Not for editing an existing route's logic or for unrelated Express projects.
---

# Adding a route to course-api

This project repeats the same shape for every resource. When asked to add a
new resource or endpoint, follow it exactly rather than improvising a new
pattern:

1. **Store first** — add the data helpers for the resource to `db/store.js`
   (e.g. `listWidgets`, `getWidget`, `createWidget`, `updateWidget`). Routes
   never hold state directly; they only call into the store.
2. **One route file per resource** — create `routes/<resource>.js` exporting
   an Express router, modeled on `routes/users.js`:
   - `GET /` — list all records.
   - `GET /:id` — fetch one record; `404 { "error": "..." }` if missing.
   - `POST /` — validate required fields; `400 { "error": "..." }` if any are
     missing; otherwise create and return `201` with the record.
   - `PUT /:id` — validate at least one updatable field is present (`400` if
     not); `404` if the record doesn't exist; otherwise return the updated
     record.
3. **Mount it** — wire the new router into `server.js` under its base path,
   next to the existing `app.use('/users', usersRouter)` line.
4. **Error shape** — every error response is JSON `{ "error": "message" }`.
   Never throw raw errors or return plain-text bodies.
5. **Tests** — add `tests/<resource>.test.js` modeled on
   `tests/users.test.js`, covering: list, get-missing (404), create,
   create-missing-fields (400), update, update-missing (404). Call
   `store.reset()` in `test.beforeEach` if the store's `reset()` needs to
   cover the new resource's seed data too.
6. **Docs** — add a section for the resource to `docs/api.md` in the same
   style as the existing `## Users` section.

Run `npm test` and `npm run lint` after scaffolding to confirm the new route
fits the existing suite cleanly.
