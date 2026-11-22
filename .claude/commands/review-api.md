---
description: Review a route or router file against this project's API conventions
argument-hint: <path to a file under routes/ or server.js>
---

Review `$ARGUMENTS` against the project conventions in CLAUDE.md and the express-route-conventions skill.

Read the file and check:
1. Input is validated in the route; missing or bad input returns `400`. POST needs both `name` and `email`. PUT is a partial update and needs at least one of them; do not require both on PUT.
2. A missing record returns `404`.
3. Every error response is JSON shaped `{ "error": "message" }`.
4. The route touches data only through `db/store.js` and holds no state of its own.
5. The router is exported with `module.exports` and mounted in `server.js` under its base path.
6. `docs/api.md` describes each endpoint in the file.

Report each item as PASS or FAIL with the line number and a one-line reason. Do not edit any files.
