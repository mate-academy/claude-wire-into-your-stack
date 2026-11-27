# NOTES: wiring Claude into the course API

## Server: `docs` (filesystem MCP, project scope)

`.mcp.json` connects the official filesystem server (`@modelcontextprotocol/server-filesystem`), pointed only at `./docs`. It needs no credentials, so nothing secret is committed. It's useful here because `docs/api.md` is the API contract: with the server connected, Claude can check routes against the documented status codes and update the docs alongside a code change.

Permissions in `.claude/settings.json`:
- **allow** only the read tools that get used: `mcp__docs__read_text_file`, `mcp__docs__read_multiple_files`, `mcp__docs__list_directory`, `mcp__docs__search_files`.
- **deny** the write tools (`write_file`, `edit_file`, `move_file`, `create_directory`), so docs edits go through Claude's normal, reviewable Edit tool rather than the server.

Used on a real task: listed and read `docs/api.md` through the server and compared it with `routes/users.js` and `routes/health.js`. Every documented endpoint and status code matches the code (including `GET /health` returning `uptime`), so no doc fix was needed.

## Skill: `add-endpoint`

This API repeats one pattern for every endpoint: a handler in `routes/<resource>.js`, data only through `db/store.js`, `400`/`404` with `{ "error": "..." }`, supertest tests with `store.reset()` in `beforeEach`, and an entry in `docs/api.md`. The skill writes that down as six ordered steps.

The description names the task in the words people actually use ("add, create or implement an endpoint, route or API method") and gives concrete examples (`GET /users/:id/posts`, `DELETE /users/:id`), so a request like "add a DELETE endpoint for users" matches it, while unrelated work (a lint fix, a README edit) doesn't.

## Command: `/review-changes`

A pre-PR review against this project's own checklist: store-only data access, 400/404 and error shape, tests for success/404/400, lint, docs in sync, no secrets. It's the same six checks every time before a PR, so it's worth one word instead of retyping them. `$ARGUMENTS` takes an optional focus (e.g. `/review-changes validation`), and `argument-hint` shows that in the picker.

## Hook: lint the edited file (PostToolUse, `Write|Edit`)

After Claude writes or edits a `.js` file, `.claude/hooks/lint-edited-file.js` runs `eslint --fix` on just that file. It **reacts** (PostToolUse), because the goal is to fix style right after the edit, not block it. If ESLint finds something it can't fix, the hook exits `2` and the errors go back to Claude, so a broken file doesn't slip through until CI.

Checked by feeding it a hook payload: a clean `routes/users.js` passes (exit 0); a file with an undefined variable and an empty block is reported with both ESLint errors (exit 2).

## Headless run

Task: check that `docs/api.md` matches the routes, without anyone watching.

```
claude -p "Compare docs/api.md with the routes in routes/ and list any endpoint or status code that doesn't match." --allowedTools "Read,Grep,Glob,mcp__docs__read_text_file,mcp__docs__list_directory" --max-turns 8
```

Locked down to reading: the built-in Read/Grep/Glob tools for the code and the two read tools from the docs server. No Edit, Write or Bash, so the run can report a mismatch but can't change anything, and `--max-turns` stops it from looping.
