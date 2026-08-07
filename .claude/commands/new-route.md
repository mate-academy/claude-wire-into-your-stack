Scaffold a new Express route for the resource named "$ARGUMENTS".

- Create `routes/$ARGUMENTS.js` following the project conventions in `routes/users.js`: one router file, all data access through `db/store.js`, JSON error responses shaped `{ "error": "message" }`, `400` for bad input, `404` for missing records.
- Add the matching store helpers to `db/store.js` (list, get, create, update, reset support).
- Mount the router in `server.js`.
- Create `tests/$ARGUMENTS.test.js` mirroring `tests/users.test.js`: reset store in `beforeEach`, cover list, get-missing, create, update, update-missing.

After scaffolding, run `npm test` to confirm the new tests pass.
