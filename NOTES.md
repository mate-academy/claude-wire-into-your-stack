# Notes

## Server (MCP)
I connected the official filesystem server at project scope in `.mcp.json`, pinned to `@modelcontextprotocol/server-filesystem@2.0.1` and pointed only at `./docs`. It needs no credentials and gives Claude a sandboxed, read-friendly view of the API reference without exposing the rest of the repo. (An older release, `2025.8.21`, failed `tools/list` schema validation in Claude Code, hence the pin to 2.0.1.) The permission rule in `.claude/settings.json` allows only `mcp__filesystem__read_text_file`, `mcp__filesystem__list_directory` and `mcp__filesystem__search_files`, so the write tools stay behind a prompt. `enabledMcpjsonServers` pre-approves just this one server for teammates.

## Skill
`add-users-route` captures how a route is added here: store helper in `db/store.js` first, one router file per resource mounted in `server.js`, validation with `400`/`404`, the `{ "error": "message" }` shape, a `node:test` + `supertest` test, and an entry in `docs/api.md`. The description names concrete triggers ("add, change, or extend an HTTP endpoint or route in this Express API", with examples such as `DELETE /users/:id`) and lists what it covers, so it fires on endpoint work and not on unrelated tasks. I confirmed it: asking "Add a DELETE /users/:id endpoint." without naming the skill made Claude call it.

## Command
`/review-routes <file>` reviews a route file against the conventions in `CLAUDE.md` (store-only data access, validation, error shape, mounting, docs and tests) and reports `file:line - problem - fix`. It is worth a shortcut because I would otherwise retype the same checklist for every route change. It takes the file through `$ARGUMENTS` and is restricted to read-only tools (`Read, Grep, Glob`).

## Hook
A `PostToolUse` hook on the `Edit|Write` matcher runs `.claude/hooks/lint-fix.js`. It reacts after a change rather than preventing one: for `.js` files under `server.js`, `routes/`, `db/` and `tests/` it runs `eslint --fix`, and if lint errors remain it exits with code 2 so the errors are fed back to Claude to fix. I triggered it with a file containing an undefined call and it reported `no-undef` and exited 2.

## Headless run
I ran, with `claude -p`, a task that reads `docs/api.md` through the filesystem server and lists the documented endpoints, with `--allowedTools "mcp__filesystem__read_text_file" "mcp__filesystem__list_directory" --permission-mode dontAsk`. Only two read-only MCP tools were allowed, no shell, no edits, and anything else is denied automatically, so it is safe to run unattended.
