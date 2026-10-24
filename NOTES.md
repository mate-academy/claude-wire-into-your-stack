# NOTES — wiring Claude into the Course API

## 1. Server (MCP): `fetch`
- **What:** the official `mcp-server-fetch` server, run with `uvx`, added with `claude mcp add --scope project fetch -- uvx mcp-server-fetch`, so it lives in the committed `.mcp.json`. It needs no key, so there are no secrets to keep out.
- **Why here:** the API is built on Express, and most questions while working on it are "what does Express actually do here?". Fetch lets Claude read the real docs instead of guessing.
- **Permission rule:** `.claude/settings.json` allows only `mcp__fetch__fetch`, the server's one read-only tool, not `mcp__fetch` as a whole. `enabledMcpjsonServers: ["fetch"]` turns the server on for teammates (and headless runs) without a prompt.
- **Used it:** `claude -p "Use the fetch tool to read https://expressjs.com/en/4x/api.html#res.sendStatus …" --allowedTools mcp__fetch__fetch`. It read the Express response docs and explained that `res.status(204).end()` is the right fit for a DELETE in this API.

## 2. Skill: `add-api-endpoint`
- **What it captures:** the path every endpoint here takes. Data helpers go in `db/store.js` (seeded so `reset()` works), there's one router file per resource mounted in `server.js`, input is validated with `400`/`404`, errors are always `{ "error": "message" }`, tests use `node:test` + supertest with `store.reset()`, the endpoint is documented in `docs/api.md`, and lint and tests are run at the end.
- **Description wording:** it names the triggers people actually type ("adding or changing an HTTP endpoint or resource", the HTTP verbs, "a new resource like /posts") and the files it touches. It also says what it's *not* for (config, CI, non-route refactors) so it doesn't fire on unrelated work.
- **Confirmed:** `claude -p "Add a DELETE /users/:id endpoint to the API."` (skill not named) called `Skill(add-api-endpoint)` first. It then made the changes the skill describes in the store, route, tests and docs. I reverted that code afterwards, since this project doesn't change the app.

## 3. Command: `/review [target]`
- **What:** `.claude/commands/review.md` reviews uncommitted changes, a git ref, or a file (`$ARGUMENTS`) against the project's checklist (store-only data access, one file per resource, 400/404, error shape, tests, docs, lint and tests). It ends with a "Ready to merge / Needs changes" verdict and doesn't edit anything.
- **Why a shortcut:** this is the review I'd run before every commit and PR. Saving it means everyone checks against the same list instead of retyping it.
- **Ran it:** `/review routes/users.js` found missing tests (POST 400, PUT 400, GET /:id success) and that PUT accepts empty values that POST rejects. `allowed-tools` lists both `Bash(...)` and `PowerShell(...)` forms, because on Windows Claude runs commands through PowerShell. In a `-p` run it still asked before `npm test`, so lint and tests run only in an interactive session (or with `--allowedTools`).

## 4. Hook: lint after every edit (reacts, PostToolUse)
- **Event:** `PostToolUse`, because lint has to run on what was actually written.
- **Matcher:** `Edit|Write|MultiEdit`, the tools that change files.
- **Command:** `node "$CLAUDE_PROJECT_DIR/.claude/hooks/lint-fix.js"`. It's a Node script, so it runs the same on Windows, macOS and Linux. It runs `eslint --fix` on the edited `.js` file. If problems are left, it exits with code `2`, which sends ESLint's output back to Claude so it fixes them right away. It skips non-JS files, files outside the project and `node_modules`.
- **Triggered on purpose:** I asked Claude to write `if (!!flag) { notDefined(); }`. The hook fired (`PostToolUse:Write`), rewrote it to `if (flag)`, and reported `'notDefined' is not defined (no-undef)` back to Claude.

## 5. Headless run
```
claude -p "Run npm run lint and npm test. Reply with one line per command: the command, pass or fail, and the test count. Do not edit any files." \
  --allowedTools "Bash(npm test)" "Bash(npm run lint)" "PowerShell(npm test)" "PowerShell(npm run lint)"
```
- **Allowed:** only those two exact commands (in both shells, since Windows uses PowerShell). No `Edit`/`Write`, no other shell commands, no network. A run that goes off-script gets denied instead of acting.
- **Result:** lint passed, 5 of 5 tests passed.

## Setup for a fresh checkout
`npm install` (the hook needs ESLint locally) and `uv` installed (for `uvx mcp-server-fetch`).
