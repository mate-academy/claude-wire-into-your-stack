# Notes

**MCP server.** Connected the `github` MCP server. It's useful here because this repo lives on GitHub — it lets Claude read issues/PRs/commits and, when authorized, act on them (comment, push, open PRs) without shelling out to `gh` by hand. The permission rule in `.claude/settings.json` allows the read-only tool families (`mcp__github__get_*`, `mcp__github__list_*`, `mcp__github__search_*`) to run without a prompt; anything that writes (comments, PRs, pushes) still asks first.

**Skill.** `.claude/skills/add-crud-resource/` captures this project's repeated shape for a new resource: store helpers in `db/store.js`, a router in `routes/<resource>.js`, a mount line in `server.js`, a mirrored test file, and a docs section — all following the one working example (`users`). The description is worded around the trigger phrase ("adding a new resource/endpoint") plus concrete examples, and explicitly excludes editing existing routes or unrelated Express questions, so it only fires on "add a new resource" requests, not general route work.

**Command.** `/review-conventions` diffs pending changes against the four rules in `CLAUDE.md` (route-per-resource, all data access through `db/store.js`, 400/404 validation, `{ "error": "message" }` shape) and flags file:line violations. It's worth a shortcut because it's a checklist review done the same way every time a route changes — cheaper to invoke as a command than to re-explain each time.

**Hook.** Added a `PostToolUse` hook on the `Edit|Write` matcher in `.claude/settings.json`. It *reacts* (not prevents) — after a `.js` file is written, it runs `eslint --fix` on that file to auto-clean anything fixable (e.g. `no-unused-vars`, `no-extra-boolean-cast`), silently no-oping on non-`.js` files.

**Headless run.** Ran `claude -p` to add one missing test case (`POST /users` → `400` on a missing field) to `tests/users.test.js`. Locked down to exactly the tools the task needed: `Read`, `Edit`, and `Bash(npm test)` — no broader shell access, no other files touched.
