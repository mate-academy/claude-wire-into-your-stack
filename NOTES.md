# NOTES

## Server
I connected the `fetch` MCP server (`uvx mcp-server-fetch`) at project scope, so it lives in the committed `.mcp.json`. It needs no credentials, and it lets Claude read live Express and HTTP references while writing routes. The permission rule in `.claude/settings.json` allows only `mcp__fetch__fetch`, so nothing else from the server is pre-approved. I used it once on a real page (the Express 4.x API reference) and it returned the page heading. The first attempt failed because `uvx` was still downloading the package, and the second attempt worked.

## Skill
`add-route` captures how this project writes an endpoint: one router per resource mounted in `server.js`, all data through `db/store.js`, `400`/`404` validation with `{ "error": "message" }` bodies, tests that call `store.reset()`, a `docs/api.md` update, and finishing with `npm test` and `npm run lint`. The description names the exact triggers (adding, changing, or testing an Express endpoint, with example requests) and says what it is not for. I asked for "add a DELETE /users/:id endpoint" without naming the skill, and Claude chose `add-route` and followed its steps.

## Command
`/review-routes [file or route]` reviews code against the project checklist and returns a PASS/FAIL list with `file:line` for failures. It is read-only. It's worth a shortcut because the same review gets asked after every route change. On its first run against `routes/users.js` it found a real gap: no `400` tests for `POST` or `PUT`.

## Hook
A PostToolUse hook on `Edit|Write` runs `npx eslint --fix` on any edited `.js` file. It reacts to an edit instead of preventing one: the hook runs after the tool has finished, so the edit has already happened and the hook cannot block it. When ESLint finds an error the hook exits with code 2, which reports the failure back to Claude so it can fix the problem in the same turn. I tested it by writing `console.log(notDefined);`. The file was written, and the hook then reported the `no-undef` error. If the standard had to stop an action from happening at all, I would use a PreToolUse hook instead.

## Headless run
I ran `claude -p "Run npm test and summarize the results in two sentences." --allowedTools "Bash(npm test)" "Read"`. It allows exactly one shell command plus file reading, with no Edit, Write, or general Bash, so it is safe with nobody watching. All 5 tests passed.
