# NOTES.md

## MCP server

Connected the `filesystem` server (`@modelcontextprotocol/server-filesystem`) at project scope in `.mcp.json`, scoped to this repo's directory. It is credential-free and lets Claude browse and read project files directly through MCP rather than shelling out.
The filesystem server uses a relative `.` path in `.mcp.json`, so the configuration remains portable when teammates clone the repository to different local directories; no path update is required after cloning.

The permission rule in `.claude/settings.json` allows only the read-only tools `list_directory`, `read_file`, and `get_file_info`. It explicitly denies `write_file`, `edit_file`, `create_directory`, and `move_file`, so the server cannot be used to modify the filesystem even though it is capable of it.

The server was used once to read `package.json` and report the project's name and available npm scripts.

## Project skill

`add-route` (`.claude/skills/add-route/SKILL.md`) captures this repo's repeated workflow for adding a new API route or endpoint: one route file per resource, all data access through `db/store.js`, `400`/`404` validation conventions, mounting in `server.js`, and the test/lint verification steps from `CLAUDE.md`.

The description is scoped to "adding a new route/endpoint" and explicitly excludes editing existing routes, unrelated bug fixes, and non-HTTP changes, so it fires on requests like "add a route for X" without hijacking general bug-fix or refactor work.

## Custom command

`/test` (`.claude/commands/test.md`) takes a file path and writes or updates its test file, matching this project's existing style (`node:test` + `supertest`, `beforeEach(() => store.reset())`, one `test()` per behavior), covering the happy path plus obvious `400`/`404` edge cases, then runs `npm test` and iterates until it passes.

It is useful as a shortcut because "add tests for this file" is a task that can be repeated whenever a route or store file changes.

## Hook

`.claude/hooks/block-force-push.sh` is a `PreToolUse` hook matching the `Bash` tool. It blocks `git push --force` and `git push -f`, while explicitly allowing `--force-with-lease`. It exits with code 2 when a disallowed force-push is detected, blocking the tool call.

This stops Claude from force-pushing over a teammate's work on this repo and is enforced automatically rather than relying on remembering not to.

## Headless task

Ran `claude -p` headless to audit every route file under `routes/` against the conventions in `CLAUDE.md`, using exactly `--allowedTools "Read,Glob"`.

The audit used only `Read` and `Glob` — enough to enumerate and read the route files, with no `Edit`, `Write`, or `Bash` access.

It found `routes/health.js` and `routes/users.js`, and flagged one minor edge case in `routes/users.js`: a non-numeric ID such as `/users/abc` becomes `NaN` and currently results in a `404` rather than potentially being treated as a `400` bad-input case.

The headless task modified no files.

## Secrets

No secrets were committed. The `filesystem` server needs no API key or token, and `.mcp.json` has an empty `env` object, so there were no credentials to keep out of the repo.
