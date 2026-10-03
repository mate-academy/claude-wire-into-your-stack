# Wiring Claude into the course API — notes

## Server (MCP)
I connected the official filesystem server (`@modelcontextprotocol/server-filesystem`) as `docs`, scoped to the `docs/` folder only, in a committed `.mcp.json`. It runs through `npx`, so teammates need no credentials or Python. It's useful here because `docs/api.md` is the API's contract, and every route change should be checked against it. The permission rule in `.claude/settings.json` allows only the read-only tools `mcp__docs__read_text_file`, `mcp__docs__list_directory` and `mcp__docs__search_files`. It does not allow the server as a whole, so its write and edit tools still prompt. In my first real use (the headless run below), Claude read `api.md` through the server and compared it against the routes.

## Skill — `express-route`
Every endpoint in this repo follows the same five steps:
1. Add a store helper in `db/store.js`.
2. Write a route in `routes/<resource>.js` with early-return `400`/`404`.
3. Return errors as `{ "error": "message" }`.
4. Write supertest tests with `store.reset()` in `beforeEach`.
5. Add a `docs/api.md` entry.

The skill records those steps with a status-code table and examples. The description names the concrete triggers ("add, create, modify, or extend an API endpoint, route, or resource") with example requests. It also excludes general questions, refactors outside `routes/`, and tooling changes, so it doesn't fire on unrelated work. I confirmed it fires by asking for a "DELETE /users/:id endpoint" plan without naming the skill: Claude invoked `express-route` first, then planned all four file changes, including the 204/404 behavior, the tests and the docs.

## Command — `/review-changes [base]`
This command reviews the branch diff (base defaults to `main`) against the CLAUDE.md checklist: store-only data access, 400/404 validation, the error shape, tests, docs, and no secrets. It also runs `npm test` and `npm run lint`, then reports ✅/❌ per item with `file:line` and a verdict. It earns a shortcut because I'd run it before every PR. Its `allowed-tools` are limited to git read commands, test, lint and file reads, and it is told not to modify files. On its first run against this branch it caught a real problem: the hook would block every edit on a checkout without `npm install`. I fixed that by making the hook skip when ESLint isn't installed.

## Hook — ESLint on every JS edit (reacts, `PostToolUse`)
- **Event:** `PostToolUse`. The standard is "code is lint-clean". That can only be checked after the file exists, so the hook reacts rather than prevents.
- **Matcher:** `Edit|Write|MultiEdit`, the tools that change files.
- **Command:** `.claude/hooks/eslint-fix.sh`. It runs `eslint --fix` on the edited `.js` file. If problems remain, it exits `2` so Claude sees the ESLint output and fixes it right away, instead of CI failing later.

I triggered it by writing a file that calls an undefined function. The hook exited 2 with `'foo' is not defined (no-undef)`. A clean file passes silently.

## Headless run
```bash
claude -p "Using the docs MCP server (not the Read tool), read api.md and compare it against routes/users.js and routes/health.js. List any endpoint, status code, or body field that is documented but not implemented, or implemented but not documented. Do not change any files." \
  --allowedTools "mcp__docs__read_text_file" "mcp__docs__list_directory" "Read(routes/**)"
```
I allowed only three things: reading docs through the MCP server, listing the docs folder, and reading files under `routes/`. There's no Bash, Edit or Write, and no reads outside `routes/`, so the run can't change anything, even with nobody watching. An unlisted tool call (`list_allowed_directories`) was denied, which showed the scoping holds.

Findings:
- All five endpoints match the docs.
- Three behaviours aren't documented:
  - Non-numeric ids return 404 rather than 400.
  - `PUT` accepts empty strings.
  - Malformed JSON returns Express's HTML 400 instead of `{ "error": ... }`.

## Setup for a fresh checkout
1. Run `npm install`, which the hook needs.
2. Open `claude` once in the folder and accept the trust dialog. Until you do, Claude Code ignores the project `settings.json`, including its permissions and hook.
3. Approve the `docs` server when prompted.
