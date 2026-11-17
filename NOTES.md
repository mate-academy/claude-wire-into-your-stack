# NOTES: Wiring Claude into the Course API

## 1. Server (MCP)

I connected the **fetch** server (`uvx mcp-server-fetch`) at project scope, so it's in the committed `.mcp.json` and every teammate gets it. It needs no credentials. It's useful here because Claude can pull in current reference pages (Express routing, Node's test runner, ESLint rules) and check the code against them, so it doesn't rely on memory. The permission rule in `.claude/settings.json` allows only `mcp__fetch__fetch`, the server's single read-only tool, not the whole server. I used it to fetch the Express routing guide and compare `routes/users.js` against it.

Setup note: the server needs [uv](https://docs.astral.sh/uv/) (`winget install astral-sh.uv` on Windows). Restart your terminal after installing so `uvx` is on PATH, and approve the server the first time `claude` starts. The first launch can be slow while uv downloads Python and the package.

## 2. Skill: `express-route`

The skill captures how this project writes an endpoint: add store helpers in `db/store.js` first (routes never hold state), use one router per resource mounted in `server.js`, check input in the route, return `400`/`404`, send errors as `{ "error": "..." }`, add supertest tests for every error branch, and add an entry to `docs/api.md`. The rules come from `routes/users.js`, the existing reference implementation. The description uses the words a user would actually type ("add a /products endpoint", "add DELETE /users/:id", GET/POST/PUT/PATCH/DELETE handlers in `routes/`) and rules out non-route work like lint config, CI and README edits, so it doesn't fire on those. I confirmed it fires on "Add a DELETE /users/:id endpoint" without the skill being named.

## 3. Command: `/review-route`

`/review-route <file>` reviews a route file against the project's conventions using 10 checks: store-only data access, 400 validation, 404 handling, error shape, status codes, returned responses, mounting, test coverage, docs and handler comments. It reports a pass/fail table and lists each failure with its `file:line` and a fix. It's read-only (`allowed-tools: Read, Grep, Glob`) and works on any route, including ones a person wrote by hand. It's worth a shortcut because this is the checklist you'd otherwise retype for every review. It pairs with the skill: the skill helps Claude write routes the right way, and the command checks them. Its first run found real gaps: three handlers in `routes/users.js` have untested error branches.

## 4. Hook: lint after edits

The hook is a **`PostToolUse`** hook with the matcher `Edit|Write|MultiEdit`, so it **reacts** after Claude changes a file. It runs `.claude/hooks/lint-js.js`, which lints the edited `.js` file with the project's own ESLint config. On errors it exits with code 2 and sends the ESLint report back to Claude, which then fixes the problem right away. Warnings don't fail the hook. It skips non-JS files, `node_modules` and paths outside the project, and if ESLint isn't installed it lets the edit through rather than blocking it. I chose to react rather than prevent because lint can only be checked once the edit exists. I triggered it on purpose by adding a call to an undefined function, and it reported `no-undef` and Claude corrected the code.

## 5. Headless run

I ran a read-only lint review with nobody watching:

```powershell
claude -p "Run npm run lint to check server.js, routes/, db/ and tests/. Summarise the result per file. For any error or warning, read the relevant lines and explain the fix in one sentence, but do not change any files. End with a one-line verdict: 'Lint clean' or 'N problems found'." `
  --allowedTools "Bash(npm run lint)" "Read" "Grep" "Glob" `
  --disallowedTools "Edit" "Write" "NotebookEdit"
```

Only that one shell command and the read-only file tools were allowed, and the editing tools were explicitly denied, so the run couldn't change the repo. The lockdown worked: when Claude first tried to run lint through PowerShell, which wasn't allowed, the call was refused, and it fell back to the pre-approved `npm run lint`. The result was "Lint clean", with no files changed.
