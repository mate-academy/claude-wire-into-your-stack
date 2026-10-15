# Wiring Claude Code into this project

Notes on the integrations added on the `claude-integration` branch, and why each one was configured the way it was.

## 1. MCP server — `.mcp.json`

Registered the official `filesystem` MCP server (`@modelcontextprotocol/server-filesystem`), scoped to `.` (this repo's root), at **project** scope so it's committed in `.mcp.json` and shared with anyone who clones the repo — not just a personal, machine-local config.

It's restricted to read-only use: `.claude/settings.json` denies `mcp__filesystem__write_file`. Claude Code already has its own prompt-gated `Edit`/`Write` tools for making changes, so there's no need for a second, less-visible write path through MCP. This server exists purely to give Claude an alternate way to browse/search the repo.

## 2. Project skill — `.claude/skills/new-route/SKILL.md`

Triggers whenever a request asks to add/create/write a new route or endpoint (e.g. "add a DELETE /users/:id route"). It encodes the conventions already stated in `CLAUDE.md` — one router file per resource, mounted in `server.js`, all state through `db/store.js`, `400`/`404` handling, the `{ "error": "message" }` response shape, and a matching test.

Without this, each new route risked drifting from those conventions since they only live in prose in `CLAUDE.md`, which isn't always front-of-mind mid-task. Tested by asking a fresh session to "add a DELETE /users/:id route" — it fired, and the route it produced (`routes/users.js`, `db/store.js`, `tests/users.test.js`) matched the existing style exactly.

## 3. Custom command — `.claude/commands/review-route.md`

`/review-route $ARGUMENTS` — a prompt for a check I'd otherwise type out by hand every time I touch a route file: does it validate input, return the right status codes, use the correct error shape, stay out of local state, and have a test. Takes the target file as `$ARGUMENTS` so it's reusable across `routes/users.js`, future resource files, etc.

Tested against `routes/users.js` — it correctly found a real gap: `:id` params aren't validated as numeric before `Number(...)`, so a non-numeric id silently falls through to a `404` instead of an explicit `400`.

## 4. Hook — `.claude/settings.json`

A `PostToolUse` hook matching `Edit|Write` that runs `npm run lint -- --max-warnings 0` after every file change. This is a "react" hook: rather than blocking an edit before it happens, it immediately re-lints afterward so convention drift (unused vars, style issues) surfaces right away instead of at the next manual lint run or in CI.

`--max-warnings 0` is stricter than the project's own `npm run lint` (which allows `no-unused-vars` as a warning) — deliberately, since the whole point of a reactive hook is to surface anything worth looking at immediately. The underlying ESLint rule config in `eslint.config.js` was left untouched; only the hook's own invocation is stricter. Verified by:
- clean edit → exits 0, hook runs silently (visible via transcript mode, `Ctrl+O`)
- edit introducing an unused variable → hook surfaced `PostToolUse:Edit hook error / Failed with non-blocking status code: ESLint found too many warnings (maximum: 0).` immediately

## 5. Headless run

```
claude -p "List every endpoint in this API, its HTTP method, and what validation rules it enforces. Cross-check against docs/api.md and flag any mismatches." --allowedTools "Read,Grep,Glob"
```

`--allowedTools "Read,Grep,Glob"` restricts this to read-only tools — no `Edit`, `Write`, `Bash`, or MCP tools — since the task is purely informational and shouldn't be able to touch the repo. It correctly found that `DELETE /users/:id` (added while testing the skill above) isn't documented in `docs/api.md`, and could only report the gap rather than fix it, since `Write` wasn't in its allowed set.

## Verification note

Testing the skill and the command both required starting a genuinely fresh `claude` session — both are loaded at session startup, so a session already running before a `SKILL.md`/command file existed won't pick it up. Same for the hook and the MCP server: `.claude/settings.json` and `.mcp.json` are read at startup too.
