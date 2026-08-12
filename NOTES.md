# NOTES

## Server (MCP)

Connected the official filesystem MCP server (`@modelcontextprotocol/server-filesystem`),
scoped to `docs/` only, at project scope in `.mcp.json`:

```json
{
  "mcpServers": {
    "docs-fs": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./docs"]
    }
  }
}
```

It's credential-free, and the repo already has `docs/api.md` describing the route
contract — a natural thing to hand Claude a scoped, read-only view of when it's
working on routes. The permission rule in `.claude/settings.json` allows only the
two read-only tools actually used, not the whole server:

```json
"permissions": {
  "allow": [
    "mcp__docs-fs__read_text_file",
    "mcp__docs-fs__list_directory"
  ]
}
```

Write/edit/move/create tools the server exposes are deliberately left out of the
allow list.

Two things came up wiring this in that are worth recording:
- The original config used `${CLAUDE_PROJECT_DIR}/docs`; `claude mcp list` reported
  it as an unresolved variable, so it was switched to the relative `./docs`, which
  resolves fine against the server's working directory.
- A project's first-ever `.mcp.json` server requires a one-time interactive approval
  (`claude mcp list` shows it as "Pending approval" until then). Headless (`-p`)
  runs correctly refuse to auto-connect an unapproved server rather than silently
  bypassing that gate — a real one, not a bug.

Verified the server itself works by registering the identical command under a
throwaway local-scope name (pre-approved, so no trust gate) and running it headless
with the allowlist restricted to only `mcp__docs-fs-test__read_text_file` and
`mcp__docs-fs-test__list_directory` — no native `Read` available as a fallback.
It correctly read `docs/api.md` through the MCP tool and returned an accurate
summary of the documented `/users` endpoints. The throwaway registration was
removed afterward; the committed `docs-fs` entry in `.mcp.json` is what teammates
get, and it needs that one-time `claude` approval on first use, same as any new
project MCP server.

## Skill

Captured this repo's fixed shape for adding a REST resource — one router file, CRUD
helpers in `db/store.js`, mounting in `server.js`, and a mirrored test file — as
`.claude/skills/add-api-resource/SKILL.md`. The description names concrete trigger
phrases ("add a /products route", "create a new resource for orders") and explicitly
excludes editing existing routes, so it fires on "add a new resource" requests and
nothing else.

Verified by asking (without naming the skill): *"Add a /products endpoint to this
API, the same way the other resources here are built."* The response followed the
skill's four steps exactly (store helpers, router, mount, mirrored tests) and named
`add-api-resource` on its own.

## Command

Added `/check-conventions` (`.claude/commands/check-conventions.md`) — reviews the
current diff against this project's conventions (route-per-resource, all data access
through `db/store.js`, `400`/`404` usage, the `{ "error": "message" }` shape) and
reports deviations without rewriting anything. It's the review pass worth running
before every commit, so it's worth the shortcut.

Tested against a deliberately broken `routes/health.js` (module-level state held
directly in the route, plain-text error instead of JSON) — it flagged both issues
precisely and left the rest of the diff alone, then the test change was reverted.

## Hook

Added a `PostToolUse` hook on the `Edit|Write` matcher that re-lints the tracked
source with autofix after every edit:

```json
"hooks": {
  "PostToolUse": [
    {
      "matcher": "Edit|Write",
      "hooks": [{ "type": "command", "command": "npx eslint --fix server.js routes db tests" }]
    }
  ]
}
```

Reacts rather than prevents — style should self-correct, not block the edit. Chose
`PostToolUse` over `PreToolUse` because there's nothing to validate before the edit
lands, only after. Triggered on purpose via a headless edit to `db/store.js`; the
hook ran and `eslint --fix` reported no errors on the tracked files.

## Headless run

Ran, with nobody watching:

```
claude -p "Run the test suite and the linter for this project, and report whether both pass." \
  --allowedTools "Bash(npm test:*) Bash(npm run lint:*)"
```

Locked the allowlist to exactly those two npm scripts — no file writes, no arbitrary
Bash, no MCP tools — since the task was read-only verification that the wiring
changes hadn't broken anything. Result: 5/5 tests passed, lint clean.
