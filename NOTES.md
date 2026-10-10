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

## 5. Headless Task: Add DELETE Route

**Task:** "Add a DELETE /users/:id route to remove a user. Follow the project's express-route pattern."

**Run:** `claude -p` with `--allowedTools Read,Edit,Bash`

**What was allowed and why:**
- `Read` — necessary to read existing routes and the db/store.js API
- `Edit` — required to add the DELETE route to routes/users.js and the deleteUser function to db/store.js
- `Bash` — needed to run tests afterward (optional but safe)

**What was locked down:**
- No Glob (unnecessary for this scoped task)
- No Grep (read-only pattern matching not needed)
- No Git operations (prevents unintended commits)
- No network access (keeps scope local)

**Result:** Claude added the DELETE route following the express-route pattern automatically (skill fired), implemented deleteUser in the store, and all tests passed. The task ran to completion without supervision, proving the wiring is safe for unattended use.
