# Project Wiring Notes

## 1. Server: Filesystem MCP for Documentation

**What:** Connected a filesystem MCP server pointing to the `docs` folder, accessible at project scope via `.mcp.json`.

**Why:** The Express API needs reference material — documentation, API specs, and project guidelines. A filesystem server gives Claude read-only access to docs without requiring credentials or external APIs.

**Permission rule:** Scoped to read-only tools only:
- `mcp__filesystem__read_file` — read documentation
- `mcp__filesystem__list_resources` — list doc files

This prevents write access and keeps the scope minimal.

## 2. Skill: Express Route Pattern

**What:** Created `.claude/skills/express-route/SKILL.md` that encodes the project's route-writing standard.

**How it fires:** The description specifically mentions "add a new route, endpoint, or handler," so it triggers when that's the task — not on every code change.

**What it captures:** The nine-step pattern that every route must follow:
- Router file structure and imports
- Required comments above handlers
- Input validation returning 400
- Data access only through `db/store.js`
- 404 handling for missing resources
- Correct HTTP status codes (201 for POST, 200 for GET/PUT/DELETE)
- Error response format always `{ error: "message" }`

## 3. Command: /review-routes

**What:** A shortcut command in `.claude/commands/review-routes.md` that audits all routes against the project's conventions.

**Why it's worth it:** Route review is frequent work on this project — checking that new routes follow the standard. Rather than describing the checklist each time, `/review-routes` saves the prompt and runs it consistently. Saves context and ensures no step is skipped.

## 4. Hook: Auto-lint on Edit

**Type:** PostToolUse hook on the Edit tool.

**What it does:** Every time a file is edited, the hook automatically runs `npm run lint`. This catches code quality issues before they're committed and holds the linting standard for everyone working on the project.

**Why react, not prevent:** ESLint catches issues but doesn't stop the edit — it informs the next action. A reactive hook is appropriate here.

## 5. Headless Task

Not yet run. This will be a single well-scoped task (e.g., "add a DELETE route") executed with `claude -p` and a tight `--allowedTools` allowlist, demonstrating that Claude can work on this project safely without direct supervision.
