# Course API

A small Express API used as the working project throughout the Claude Code course.

## Conventions
- One route file per resource; mount it in `server.js` under its base path
- All data access goes through `db/store.js` — routes never hold state directly
- Validate input in the route and return `400` on bad input, `404` when a record is missing
- Error responses are JSON in the shape `{ "error": "message" }`
