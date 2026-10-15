Review the route file at `$ARGUMENTS` against this project's conventions and flag every deviation clearly.

Check each handler for:
1. **Data access** — all reads and writes go through `db/store.js`. Flag any direct state in the route file.
2. **Input validation** — bad or missing input returns `400` with `{ "error": "..." }`. Flag missing validation or wrong status codes.
3. **Not-found handling** — missing records return `404` with `{ "error": "..." }`. Flag any case that would crash or return the wrong status.
4. **Error shape** — every error response must be `{ "error": "message" }`. Flag any other shape.
5. **Handler comments** — each `router.get/post/put/delete` call must have a one-line comment above it describing what it does. Flag missing comments.
6. **Export** — the file must end with `module.exports = router`. Flag if missing.

For each issue found, quote the offending line and explain what the convention requires.
If the file is clean, say so explicitly.
