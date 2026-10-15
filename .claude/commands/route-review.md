---
description: Review a route file (or all routes) against this project's conventions
argument-hint: [path/to/route.js]
---

Review $ARGUMENTS against this project's conventions. If no file was given, review every file in `routes/`.

Check each point and report PASS/FAIL with the line number for every FAIL:

1. The file exports an Express router (`module.exports = router`) and is mounted in `server.js` under a sensible base path.
2. No state is held in the route file — every read/write goes through `db/store.js`.
3. Route params used as ids are converted with `Number(...)`.
4. Input is validated in the handler; bad input returns `400`, missing records return `404`.
5. Every error response is JSON of exactly the shape `{ "error": "message" }`.
6. Each handler has a `// METHOD /path — description` comment.
7. Each handler has matching tests in `tests/` covering the success path and each error status.
8. The endpoint is documented in `docs/api.md`.

Finish with a one-line verdict: ready to merge, or what to fix first. Do not change any files — this is a review only.
