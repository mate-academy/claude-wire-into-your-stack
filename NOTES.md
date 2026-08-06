# Notes

## MCP Server
**Which server:** The `fetch` server registered in `.mcp.json` via `uvx mcp-server-fetch`.
**Why useful:** It gives Claude Code the ability to retrieve web content as tools/resources, so the agent can look up documentation (MCP spec, Claude Code skills, hooks) without that knowledge being baked into the model.
**Permission rule:** `.claude/settings.local.json` (git-ignored, user-specific) contains `{"enabledMcpjsonServers": ["fetch"]}`, which opts the user's session into using just that one server from `.mcp.json`.

## Project Skill
**What it captured:** The Course API's repeated conventions — `express.Router()` handlers that delegate all state to `db/store.js`, `node:test` + `supertest` tests with `beforeEach(() => store.reset())`, `Number(req.params.id)` ID parsing, and 404 responses shaped as `{ "error": "message" }`.
**How it fires:** The `description` in `.claude/skills/course-api-patterns/SKILL.md` says: *"When writing, modifying, or reviewing route handlers (routes/*.js), test files (tests/*.test.js), or error-response conventions for the Course API Express project…"* — specific enough that the skill auto-triggered when the agent was asked to add a DELETE route, without naming the skill.

## Command Hook / Auto-format
**What was added:** A `PostToolUse` hook in `.claude/settings.json` that runs `.claude/hooks/format-after-edit.sh` after any `Edit|Write` tool call.
**Why it saves a shortcut:** It auto-runs `eslint --fix` on every `.js` file edit, so the user never has to remember to lint — the code is clean on save, every time.

## Hook Behavior
**React or prevent:** React — fires *after* the edit succeeds (PostToolUse), never blocks the user's work.
**On which event:** `PostToolUse` with matcher `Edit|Write` on `*.js` files only. Failures are swallowed (`|| true`) so a missing dependency or lint error can't interrupt the edit flow.

## Headless Run
**What ran:** A `DELETE /users/:id` endpoint task via `echo '<prompt>' | claude --output-format text --allowedTools "Read Edit Bash"`.
**What was locked down:** Only `Read`, `Edit`, and `Bash` were allowed — no `Write`, `Grep`, `Glob`, `Agent`, `Monitor`, or other tools. Three file edits + `npm test` produced 7/7 passing tests with clean lint, all within a constrained, reviewable permission set.