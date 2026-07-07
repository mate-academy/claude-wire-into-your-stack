Review the current git diff (staged and unstaged) against this project's conventions and flag any violations. Check each of the following:

1. **Route placement** — every new route handler lives in `routes/`, not in `server.js` or elsewhere.
2. **Data access** — routes read and write only through `db/store.js`; no in-route state.
3. **Mounting** — any new router is mounted in `server.js` under its base path.
4. **Error shape** — all error responses are JSON `{ "error": "<message>" }` with no other shape.
5. **Status codes** — bad input → 400, missing record → 404, created → 201, success → 200.
6. **Input validation** — required fields are validated in the route before calling the store.
7. **Tests** — a test file exists for every new route file, covering at minimum: list, 404 on missing, create (201), update, update 404.

For each violation found, show the file, line number, and a one-line explanation. If everything looks clean, say so in one sentence.
