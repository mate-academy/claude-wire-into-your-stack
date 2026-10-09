# NOTES

## Setup for a fresh checkout
- Run `npm install`. The lint hook uses the local `node_modules/eslint`.
- Install [`uv`](https://docs.astral.sh/uv/) so `uvx` is on your PATH. The fetch server is the Python package `mcp-server-fetch`.
- Start `claude` in the repo and approve the project-scoped `fetch` server when prompted.

## Server: fetch
I connected the official `mcp-server-fetch` at project scope (`.mcp.json`, command `uvx mcp-server-fetch`). It needs no credentials and lets Claude pull in outside references, such as the Express docs, when checking this API against how Express expects things to work. `.claude/settings.json` allows exactly one tool, `mcp__fetch__fetch`, rather than the whole server. Fetch is read-only, and any other tool the server adds would still ask first. I picked the official server over a community npm one because it is maintained by the MCP project and I didn't want to run an unvetted package.

## Skill: add-route
The skill captures how a route is added in this project: data access through `db/store.js`, one file per resource in `routes/` mounted in `server.js`, validation with `400`/`404`, errors as `{ "error": "message" }`, then tests and a `docs/api.md` entry. The description is specific on purpose. It names the triggering tasks ("add a DELETE /users/:id route", "add an orders endpoint"), the files and conventions involved, and ends with what it is not for (README, lint-only, non-route changes), so it fires on endpoint work and not on unrelated edits.

## Command: /review-conventions
`/review-conventions [file, folder or git ref]` checks code against the six conventions in `CLAUDE.md` and reports PASS, FAIL or N/A per item, with `file:line` and a fix for each FAIL. With no argument it reviews the uncommitted diff. It is worth a shortcut because I would run the same review before every PR, and typing the checklist each time invites drift. `$ARGUMENTS` takes the single free-form target, and `allowed-tools` keeps it read-only.

## Hook: lint on edit
A `PostToolUse` hook with matcher `Edit|Write` runs `.claude/hooks/lint-on-edit.js`. It reacts and does not prevent: after Claude edits a `.js` file, ESLint runs on that file, and on errors the report goes back to Claude through exit code 2 so it fixes the problem in the same turn. I chose PostToolUse because lint needs the file as written, and I chose report-only (no `--fix`) so Claude never gets silent rewrites. The script runs ESLint's entry point through `process.execPath`, because `shell: true` strips backslashes from Windows paths.

## Headless run
```
claude -p "/review-conventions routes/users.js" --allowedTools "Read" "Grep" "Glob" "Bash(git diff:*)" "Bash(git status:*)"
```
I ran the review command headless. Allowed: reading and searching files, and `git diff`/`git status` to see changes. Locked down: no `Edit`, `Write` or general `Bash`, so an unattended review cannot change anything (`git status` was clean afterwards). It found missing tests for the `GET /users/:id` success case and the two `400` branches, plus an unhandled missing request body and non-numeric ids returning `404`. I left those unfixed because they are outside this PR's scope. Headless mode also ignored the project `permissions.allow` entry until the workspace is trusted, so the CLI flag is the permission set to rely on there.
