---
description: Scaffold a new Express resource route following this project's conventions
---

Scaffold a new resource route for **$ARGUMENTS** (singular resource name, e.g. `product`), following this repo's conventions in CLAUDE.md:

1. Add the in-memory data helpers for this resource to `db/store.js` — a `list<Resource>s`, `get<Resource>`, `create<Resource>`, and `update<Resource>` function, matching the shape and naming of the existing `users` helpers. All state lives here, not in the route file.
2. Create `routes/<resource>s.js` exporting an Express router with:
   - `GET /` — list all
   - `GET /:id` — fetch one, `404` with `{ "error": "message" }` if missing
   - `POST /` — create, `400` with `{ "error": "message" }` if required fields are missing
   - `PUT /:id` — update, `400` if no updatable field is given, `404` if the record doesn't exist
3. Mount the new router in `server.js` under `/<resource>s`, next to the existing routers.
4. Add a section to `docs/api.md` documenting the new endpoints, matching the style already used for Users.
5. Remind me (don't do it) that tests still need to be added for the new route — that's a separate step.

Ask me what fields the resource has before writing the store helpers and route if it's not obvious from context.
