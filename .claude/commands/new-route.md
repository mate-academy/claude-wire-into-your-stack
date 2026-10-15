---
description: Scaffold a new Express route with inline validation and tests, per project conventions
---

Create a new Express route called:

$ARGUMENTS

Follow this project's conventions (see CLAUDE.md):
- One route file per resource in `routes/`, mounted in `server.js` under its base path
- No controller layer — the route handler itself validates input and calls `db/store.js`
- All data access goes through `db/store.js`; routes never hold state directly
- Validate input in the route; return `400` on bad input, `404` when a record is missing
- Error responses are JSON in the shape `{ "error": "message" }`
- Use async/await and return JSON responses

Generate:
- route (with inline input validation and error handling)
- tests (success and failure cases)
