# NOTES

**Server (MCP).** I connected the official filesystem server (`@modelcontextprotocol/server-filesystem`, pinned to 2.2.0) at project scope in `.mcp.json`, pointed at `./docs`. It needs no credentials and gives Claude the API reference (`docs/api.md`) as a sandboxed, docs-only source. The permission rule in `.claude/settings.json` allows only the read-only tools `read_text_file`, `list_directory` and `search_files`. Write tools are not allowed. I used it headless to read `api.md` and list the status codes for `POST /users`.

**Skill.** `.claude/skills/new-route/SKILL.md` captures how a route is written here: one router per resource mounted in `server.js`, data only through `db/store.js`, 400/404 validation, `{ "error": "message" }` responses, tests with `node:test` + supertest, and a `docs/api.md` update. The description names concrete triggers (add/change a route or endpoint) and excludes general questions. I asked "Add a DELETE /users/:id endpoint." without naming the skill, and Claude invoked `new-route`.

**Command.** `/review-api [base-branch]` reviews the branch diff against the CLAUDE.md checklist, runs tests and lint, and reports PASS/FAIL per item without editing anything. It is worth a shortcut because I run the same review before every PR, and `$ARGUMENTS` lets me pick the base branch.

**Hook.** A PostToolUse hook (it reacts, it doesn't prevent) matching `Edit|Write` runs `.claude/hooks/lint-edited.js`. It lints the edited `.js` file with the project's ESLint config and, on errors, exits 2 with the output so Claude fixes them immediately. I checked it against a deliberately broken file (exit 2 with the ESLint errors) and a clean one (exit 0). It also fired on every edit during the DELETE run.

**Headless.** `claude -p "Using the docs MCP server, read api.md ... then run npm test ..." --allowedTools "mcp__docs__read_text_file" "Bash(npm test)"`. I allowed only one read-only MCP tool and one exact shell command, so nothing can be written or run outside that. Unallowed calls (e.g. `search_files`) were denied.

## How to verify on a fresh checkout
1. `npm install`, then open `claude` in the project folder, accept the trust dialog (project permissions are ignored until the workspace is trusted) and approve the `docs` MCP server.
2. Server: `claude mcp list` shows `docs`; ask Claude to read `api.md` through it.
3. Skill: ask "Add a DELETE /users/:id endpoint." without naming the skill; `new-route` fires.
4. Command: run `/review-api main`.
5. Hook: edit a `.js` file so it has a lint error; the PostToolUse hook reports it back to Claude.
