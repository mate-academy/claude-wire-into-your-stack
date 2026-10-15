---
description: Review a route file (or the current diff) against this project's API conventions
argument-hint: [path-to-route-file]
allowed-tools: Read, Grep, Glob, Bash(npm test:*), Bash(npm run lint:*), Bash(git diff:*), mcp__docs__read_text_file, mcp__docs__list_directory
---

Review **$1** against this project's conventions (if `$1` is empty, review the files touched in
`git diff` instead). Read the target file, `db/store.js`, `server.js`, and `docs/api.md` (via the
`docs` MCP server if it's connected) before judging anything — don't guess at the contract.

Check, in this order, and cite `file:line` for every issue:

1. **Error shape** — every error response is exactly `{ "error": "message" }`, no bare strings,
   no extra fields.
2. **Status codes** — `400` on bad/missing input, `404` when a looked-up record doesn't exist,
   `201` on creation, `200` otherwise.
3. **State access** — the route never holds state itself; everything goes through `db/store.js`.
4. **Mounting** — if this is a new resource, it's mounted in `server.js` under its base path.
5. **Test coverage** — there's a test for the happy path and for each error branch the route can
   take (check `tests/`).
6. **Docs agreement** — `docs/api.md` describes the same behavior (status codes, required
   fields, response shape) as the code. Flag drift in either direction.

Then run `npm test` and `npm run lint` and report their results.

Output a short markdown list of findings (or "No issues found"). Do not edit any files — this
command reviews, it doesn't fix.
