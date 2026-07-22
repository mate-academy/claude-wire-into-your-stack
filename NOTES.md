# NOTES

## Server

Connected `docs-fs`, `@modelcontextprotocol/server-filesystem` scoped to `./docs`, at project scope (`.mcp.json`). It's useful here because `docs/api.md` is the source of truth for what the API is supposed to do, and letting Claude browse/read it through a scoped server keeps that lookup explicit and auditable rather than relying on ambient file access. It's credential-free, so nothing to keep out of the committed config.

The permission rule in `.claude/settings.json` allows only the read-only tools the server exposes — `read_text_file`, `read_multiple_files`, `list_directory`, `directory_tree`, `search_files`, `get_file_info`, `list_allowed_directories` — and leaves out `write_file`, `edit_file`, `move_file`, and `create_directory`, so the server can be used to look things up but not to change anything under `docs/`.

Verified it headless: asked a fresh session to summarize `docs/api.md` via the server; it listed `docs/`, read the file through the MCP tools, and correctly reported the endpoints it documents.

## Skill

`add-express-route` (`.claude/skills/add-express-route/SKILL.md`) captures the route-adding convention already written in prose in `CLAUDE.md` — one file per resource, data access only through `db/store.js`, 400 on bad input, 404 on a missing record, the `{ "error": "message" }` shape, plus a matching test and a `docs/api.md` update — as a concrete checklist Claude follows without being told the steps each time.

Worded the description to fire specifically on route/endpoint work ("adding, creating, or scaffolding a new route or endpoint... routes/, mounted in server.js") and explicitly excluded adjacent-but-different work (docs-only edits, non-route refactors, front-end) so it doesn't fire on unrelated requests.

Confirmed it fires unprompted: asked a fresh session, without naming the skill, to "Add a DELETE /users/:id endpoint to this API." It added a `deleteUser` helper to `store.js` (not inline state mutation), 404 handling, a test following the existing `beforeEach(store.reset())` + supertest pattern, and a `docs/api.md` entry — exactly the skill's checklist. Reverted that trial change afterward since this project is about wiring, not shipping a new endpoint.

## Command

`/api-check` (`.claude/commands/api-check.md`) reviews a route (or file) against the same convention checklist the skill encodes, then runs `npm test` and `npm run lint` and reports both. Worth a shortcut because it's the review pass I'd otherwise redo by hand before every PR on this repo, and it's parameterized by `$ARGUMENTS` so it works on any file, not just `users.js`.

Ran `/api-check routes/users.js` once to confirm it works: it correctly confirmed the existing conventions were followed, and flagged a real, true gap — the 400 branches on `POST /users` and `PUT /users/:id` exist in the route code but aren't covered by any test — then ran `npm test` (5/5 pass) and `npm run lint` (clean). No adjustment needed to the saved prompt.

## Hook

`PostToolUse` on the `Edit|Write` matcher (`.claude/settings.json` → `.claude/hooks/post-edit-lint.js`), committed at project scope. It reacts (not prevents) after any `.js` file is touched, running `eslint` on that file and printing violations immediately.

I initially wrote this as `eslint --fix`, following the README's own example ("auto-format after edits"), but checked `eslint.config.js` first and found this project only pulls in `@eslint/js` recommended rules (`no-unused-vars`, `no-undef`, and similar) — correctness rules, not auto-fixable style rules. `--fix` would silently do nothing here, so I changed the hook to check-and-report instead, which is the version that actually holds a standard on this specific config.

Triggered it on purpose: fed the hook script the same JSON shape Claude Code sends on `PostToolUse` (`{"tool_name":"Write","tool_input":{"file_path":"..."}}`) against a scratch file with a real unused variable, and it correctly ran eslint and printed the `no-unused-vars` warning.

One caveat: this machine's Claude Code install hadn't marked this repo as a trusted workspace yet, and project-scoped `settings.json` (both the hooks and the MCP permission rule) are ignored for an untrusted workspace even in headless mode — by design, since hooks run commands automatically with no confirmation. I didn't try to flip that flag programmatically (it's a legitimate gate). Running `claude` interactively in this repo once and accepting the trust dialog activates both for real; that's the same one-time step any teammate cloning this repo would hit.

## Headless task

Ran `/api-check routes/users.js` via `claude -p` with `--allowedTools "Read,Grep,Glob,Bash(npm test:*),Bash(npm run lint:*)"`. Locked down to exactly what a read-only convention review needs: `Read`/`Grep`/`Glob` to inspect the route, store, tests, and docs, and only the two specific `npm` scripts (not open `Bash`) so it can verify the project's own test/lint gates without being able to run anything else. No `Edit`/`Write`, since a review shouldn't be able to change the code it's reviewing.
