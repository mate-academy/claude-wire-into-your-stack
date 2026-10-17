# Notes — Wiring Claude into the Course API

## 1. MCP server
I connected the official filesystem server (`@modelcontextprotocol/server-filesystem@1.0.0`) at project scope, pointed at `./docs`. It lets Claude read `docs/api.md` and check it against the real routes, without credentials. The version is pinned so a new release can't silently change tool names or behaviour.
The permission rule in `.claude/settings.json` allows only the two read-only tools I actually use: `mcp__docs__read_text_file` and `mcp__docs__list_directory`. No write tools, and not the whole server.
Portability: `.mcp.json` uses `cmd /c npx ...` because I'm on native Windows. On macOS/Linux, use `"command": "npx"` and drop `"/c", "npx"` from `args`.

## 2. Skill — `express-route`
Captures how routes are written here: one router per resource mounted in `server.js`, data only through `db/store.js`, 400 on bad input / 404 when missing, JSON errors `{ "error": "message" }`, and tests for success/400/404.
The description names the trigger (adding or changing an endpoint/route in `routes/`) and the concrete rules, so it fires on route work and nothing else.
Verified: asked "Tambahin endpoint DELETE /users/:id" without naming the skill. With the skill loaded, Claude added 400 validation and success/400/404 tests; an earlier run without the skill (misnamed folder) skipped the 400 case. Changes were discarded afterwards.

## 3. Command — `/check-conventions`
Reviews uncommitted work (including untracked files), or a given path via `$ARGUMENTS`, against the CLAUDE.md conventions and ends with PASS/FAIL. Named to avoid the built-in `/review`.
Worth a shortcut because it's the check I'd run before every commit. Verified by planting `res.status(404).send('not found')`; it reported `routes/users.js:15` and FAIL.

## 4. Hook — ESLint after edits
`PostToolUse` (reacts, doesn't prevent), matcher `Edit|Write`, command `npx eslint --fix . 1>&2 || exit 2`. Auto-fixes what it can; if errors remain, exit code 2 sends them back to Claude so it fixes them before moving on.
Verified: an edit to `routes/health.js` showed "1 PostToolUse hook ran" in the transcript.

## 5. Headless run
`claude -p "Run npm test and summarize the results in 3 bullet points" --allowedTools "Bash(npm test)" "Read"`
Allowed only `npm test` and reading files: enough to run and explain the suite, but no edits, no other shell commands, no git. Safe to run unattended (e.g. in CI).