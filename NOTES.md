# Notes: wiring Claude into this repo

## Server (MCP)

Connected `@modelcontextprotocol/server-filesystem`, scoped to `docs/` only, as the `docs` server in `.mcp.json`. It's a credential-free, npx-run server, so any teammate who clones the repo gets it working with no setup. It's useful here because `docs/api.md` is the source of truth for the API surface — pointing Claude at it as an MCP resource (rather than relying on it happening to `Read` the right file) means the same "check the docs" behavior travels with the repo to any MCP-capable client, not just this one.

The permission rule in `.claude/settings.json` allows only `mcp__docs__read_text_file`, `mcp__docs__list_directory`, `mcp__docs__directory_tree`, and `mcp__docs__search_files` — the read-only tools the docs task actually needs. The server also exposes `write_file`, `edit_file`, `create_directory`, and `move_file`, none of which are allowed, since there's no reason for Claude to write into `docs/` through this server. Verified it by running `claude -p` headless with just those tools allowed, asking it to list and read `docs/api.md`, which came back with a correct one-line summary of the documented endpoints.

## Skill

Captured the pattern this repo repeats every time a new resource is added: functions live in `db/store.js`, the router in `routes/` mirrors `users.js`, it's mounted in `server.js`, validation returns `400`/`404` with `{ "error": "message" }`, and tests mirror `tests/users.test.js`. It's `.claude/skills/add-express-route/SKILL.md`.

The description is scoped to "adding a new REST resource or route file... or new endpoints on an existing resource" so it fires on scaffolding requests specifically, not on every code change. Confirmed it fires by running a headless prompt — "I want to add a new 'products' resource... tell me your plan" — without naming the skill, and the transcript shows `Skill({skill: 'add-express-route', ...})` was invoked automatically; the resulting plan matched the pattern (store functions, router modeled on `users.js`, mount point, test mirroring, docs update) almost verbatim.

## Command

Added `/review-api` (`.claude/commands/review-api.md`), which checks a route file (or the current diff, via `$ARGUMENTS`) against the conventions in `CLAUDE.md` — store-only data access, `400`/`404` with the right error shape, one file per resource, test coverage per status code — and reports violations as `file:line` plus a fix suggestion, without editing anything. It's worth a shortcut because this is the check I'd otherwise do manually before every PR touching a route, and doing it by hand means re-reading `CLAUDE.md` each time.

Ran it once against `routes/users.js` and it correctly flagged two real gaps: non-numeric ids on `GET/PUT /users/:id` silently fall through to `404` instead of `400`, and the test file was missing `400` coverage for `POST` and `PUT`. The missing test coverage it found is what became the headless task below.

## Hook

Added a `PostToolUse` hook on `Edit|Write` in `.claude/settings.json` that reads the edited file path from the hook's stdin JSON and runs `npx eslint --fix` on it if it's a `.js` file. It reacts rather than prevents — formatting/lint fixes are safe to apply after the fact, so there's no reason to block the edit itself with a `PreToolUse` guard. Picked this over a blocking hook because the standard it holds ("code stays lint-clean") is corrective, not a hard stop.

Triggered it by running a fresh headless session (fresh process, since hooks — like the MCP server — only load at session start) that wrote a file containing `if (!!x)`. The hook fired and rewrote it to `if (x)` before the session reported back, confirming `eslint --fix` ran automatically.

## Headless run

Ran one task with `claude -p` and `--allowedTools "Read,Edit,Bash(npm test:*)"`: add the two `400`-case tests that `/review-api` had flagged as missing from `tests/users.test.js`. Locked it down to exactly those three tools — `Read` so it could match the existing test style, `Edit` so it could add the cases, and `Bash` scoped to only `npm test` (not a bare shell) so it could verify its own work without being able to run arbitrary commands. No `Write`, since it had no reason to create new files. It added the two tests, ran `npm test`, and reported all 7 tests passing — verified independently afterward with the same command.
