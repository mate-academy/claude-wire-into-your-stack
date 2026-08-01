Scaffold a complete new resource route and its test file for this Express API.

Resource name: $ARGUMENTS

Follow the project conventions exactly:

**Route file** — create `routes/$ARGUMENTS.js`:
- Use `express.Router()` and `require('../db/store')`
- Implement GET / (list all), GET /:id (fetch one), POST / (create), PUT /:id (update)
- Return `400` with `{ "error": "..." }` for missing required fields
- Return `404` with `{ "error": "... not found" }` when a record is missing
- Return `201` on successful POST
- `module.exports = router` at the end

**Test file** — create `tests/$ARGUMENTS.test.js`:
- Import `node:test`, `node:assert`, `supertest`, `../server`, and `../db/store`
- Call `test.beforeEach(() => store.reset())` at the top
- Cover: list returns seeded data, GET /:id returns 404 for missing, POST creates, PUT updates, PUT 404 for missing

**Do not** mount the route in `server.js` or modify `db/store.js` — just create the two files and note that the caller should add `app.use('/$ARGUMENTS', require('./routes/$ARGUMENTS'))` to `server.js`.
