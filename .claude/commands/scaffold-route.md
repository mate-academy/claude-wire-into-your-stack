---
description: Scaffold a new Express route file for a resource
---

Scaffold a new route for the resource "$ARGUMENTS". Create `routes/$ARGUMENTS.js` exporting an Express router with GET (list), GET /:id (404 if missing), POST (400 on missing fields), and PUT /:id, all reading/writing through `db/store.js`. Follow `routes/users.js`'s style. Mount it in `server.js` under `/$ARGUMENTS`. Add matching CRUD helpers to `db/store.js` if absent.