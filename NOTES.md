# Session Notes

## Repo
- Cloned `https://github.com/frankmamone/claude-wire-into-your-stack` into this folder.
- Ran `npm install` (dependencies were missing, `npm test` was failing with `MODULE_NOT_FOUND`). Tests now pass (5/5).

## Added

### `.claude/skills/new-route/SKILL.md`
Skill describing the project's route pattern: require deps, validate input, read/write via `db/store.js`, standard `{ "error": "message" }` error shape (400 bad input, 404 not found), export router, mount in `server.js`.

### `.claude/commands/new-route.md`
Slash command `/new-route <spec>` that generates a new route file following the same pattern. Deliberately does **not** create a `controllers/` layer — this project has no controller abstraction; routes call `db/store.js` directly.

### `.claude/settings.json`
Added a `PostToolUse` hook: runs `npm test` after any `Bash` tool call whose command matches `npm *` (matcher `Bash`, filtered with `"if": "Bash(npm *)"`). Requires `/hooks` (or a restart) to take effect since `.claude/` didn't exist when the session started.

## Not changed
- `GET /users` already returned the full user list (`routes/users.js`) — no new route was needed for that ask.
