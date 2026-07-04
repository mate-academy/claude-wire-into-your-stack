# NOTES

## Server (MCP)

Connected `@modelcontextprotocol/server-filesystem` at project scope (`.mcp.json`), pinned to `./docs`. It's credential-free and gives Claude direct, sandboxed read access to `docs/api.md` — the API's documented source of truth — without opening the rest of the repo. The permission rule in `.claude/settings.json` allows only `mcp__docs__read_text_file`, `mcp__docs__list_directory`, and `mcp__docs__search_files` — read-only, rather than blanket-trusting the server (which can technically also write/move files within its sandboxed root).

Note: MCP servers and settings load at session start. Any teammate's first `claude` run in this repo will hit a one-time workspace trust dialog — expected Claude Code behavior, not specific to this setup. After accepting it once, the server and permission rule apply normally.

## Skill

`add-route` (`.claude/skills/add-route/SKILL.md`) captures this repo's repeated route-authoring pattern: one file per resource in `routes/`, mounted in `server.js`, all state through `db/store.js`, `400`/`404` validation, the `{ "error": "message" }` shape, supertest tests with `store.reset()`, and a `docs/api.md` entry.

Verified it fires: asked a fresh headless session to "add a DELETE endpoint for /users/:id" without naming the skill, and it produced a plan matching every convention exactly (store helper, route, tests, docs — no unnecessary `server.js` change), which is what the skill's description is worded to trigger on.

## Command

`/review-api` (`.claude/commands/review-api.md`) checks a diff (or the whole repo via `$ARGUMENTS`) against the same convention checklist the skill encodes, reporting pass/gap per rule. Worth a shortcut because it's the review I'd otherwise redo by hand on every PR that touches routes.

Ran it for real: it correctly reported every existing convention as a pass, and caught a genuine gap — `routes/health.js` has no corresponding `tests/health.test.js`.

## Hook

`.claude/settings.json` sets a `PostToolUse` hook on `Edit|Write` that runs `npm run lint`. It reacts (rather than blocks) so lint issues surface immediately after every code change instead of waiting for CI. Config confirmed correct by inspection; like the MCP server, it takes effect once a session has loaded it post-trust.

## Headless

Ran `/review-api` headless via `claude -p "/review-api" --allowedTools "Read,Bash(git diff:*),Bash(git status:*),Grep,Glob"` — locked to read-only tools only (no `Edit`, no unrestricted `Bash`), since a review task never needs to change anything. It completed unattended and returned the same real finding described above.
