# NOTES

## Server (MCP)
Connected `docs-fs`, the official `@modelcontextprotocol/server-filesystem`, scoped to `./docs` at project scope (`.mcp.json`). It's useful here because `docs/api.md` is the API's source of truth for behavior and status codes — pointing an MCP server at it means Claude can look it up directly instead of guessing from route code. The permission rule in `.claude/settings.json` allows only the read-only tools (`read_text_file`, `read_multiple_files`, `list_directory`, `list_directory_with_sizes`, `directory_tree`, `search_files`, `get_file_info`, `list_allowed_directories`) — nothing that can write, since there's no reason Claude should ever edit the docs through this server. Used it to answer a question about `POST /users`'s status codes straight from `docs/api.md`.

## Skill
`add-express-route` (`.claude/skills/add-express-route/SKILL.md`) captures how this repo adds a route: go through `db/store.js`, validate and return `400`/`404` with the `{ "error": ... }` shape, mount the router in `server.js`, add a matching test in `tests/`, and update `docs/api.md`. The description names the trigger explicitly ("adding, creating, or scaffolding a new route/endpoint") and gives concrete examples, so it fires on requests like "add a DELETE endpoint" without ever naming the skill, and stays quiet on unrelated work. Confirmed it fires: asking for a DELETE `/users/:id` endpoint without naming the skill caused it to load first, and it produced a correct store helper, route, test, and docs update, all passing `npm test`.

## Command
`/review-endpoint` (`.claude/commands/review-endpoint.md`) checks a given route file against the `CLAUDE.md` conventions checklist (store-only data access, validation, status codes, mounting, test coverage, docs accuracy) and reports pass/fail per handler. It's worth a shortcut because it's the exact review I'd want to run on any route before opening a PR, and running it against `routes/users.js` correctly caught three real gaps in `tests/users.test.js` (missing success-path and `400` tests) without touching any files.

## Hook
A `PreToolUse` hook on `Bash` (`.claude/hooks/guard-destructive-git.sh`) blocks commands matching force-push, hard reset, or `rm -rf` before they execute, exiting 2 with an explanation. It's a *prevent*, not a react, because a destructive git/shell command is exactly the kind of thing that shouldn't get a second chance after the fact — especially once headless runs are in the picture. Confirmed it fires: a headless session that attempted `rm -rf ./scratch-test-dir` had the `Bash` call intercepted by the hook, and the directory was left untouched.

## Headless task
Ran `claude -p` to add `tests/health.test.js` (the one untested route) with `--allowedTools "Read,Edit(tests/**),Bash(npm test:*)"`. Locked it down to only editing inside `tests/` and only running `npm test` — no access to app routes, `db/store.js`, or arbitrary shell commands — since the task was pure test-writing and didn't need anything more. It added the test and the full suite passed (6/6) without touching anything outside scope.

*(Demo edits from testing the skill, hook, and headless task were reverted afterward so this PR only carries the wiring: `.mcp.json`, `.claude/`, and this file.)*
