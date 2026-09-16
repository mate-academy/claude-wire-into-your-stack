---
description: Write or update tests for a given file
argument-hint: [file-path]
---

Write or update tests for the file at: $ARGUMENTS

1. Read the target file to understand what it does (routes, store functions, etc.).
2. Read the existing test file(s) in `tests/` to match the current style:
   - Node's built-in `node:test` + `node:assert`, `supertest` for HTTP routes
   - `test.beforeEach(() => store.reset())` when a route or store touches shared state
   - One `test(...)` block per behavior, named as `METHOD /path does X`
3. Determine the matching test file (e.g. `routes/users.js` -> `tests/users.test.js`).
   If it exists, update it in place. If not, create it following the same style.
4. Cover:
   - The main/happy-path case(s)
   - Obvious edge cases: missing/invalid input (400), missing records (404), and any boundary conditions visible in the code
5. Follow this project's conventions from CLAUDE.md: error responses are `{ "error": "message" }`, all data access goes through `db/store.js`.
6. Run `npm test` and report whether it passes. If it fails, fix the tests (or flag a real bug) and re-run until it passes.
