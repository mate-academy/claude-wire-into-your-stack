Review the route file at $ARGUMENTS against this project's conventions in CLAUDE.md. If no path is given, say so and stop.

Read the file and check each rule:

- It is a single Express router for one resource and is mounted in `server.js` under its base path.
- It reads and writes data only through `db/store.js`, and holds no state of its own.
- Every handler validates input and returns `400` with `{ "error": "message" }` on bad input.
- A missing record returns `404` with `{ "error": "message" }`.
- Path ids are coerced with `Number(req.params.id)` before they reach the store.
- The response for a successful create is `201`.
- There is a matching test in `tests/` that covers success, `400`, and `404`.

Reply with a short checklist: one line per rule, marked pass or fail, with the line number for each failure and a suggested fix. Do not edit the file.
