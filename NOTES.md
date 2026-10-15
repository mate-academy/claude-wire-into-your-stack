# Wiring Claude into the Stack - Project 3

## 1. Server: Project Documentation MCP

**Server chosen:** Custom Node.js MCP server (`project-docs`)

**Why it's useful:** The project documentation lives scattered across several files (CLAUDE.md, docs/api.md, routes, tests). This server centralizes access to project documentation and structure, allowing Claude to read API specs and understand the codebase architecture quickly without manual file navigation.

**Permission rule:** Scoped to two tools:
- `tools/read_file`: Read project documentation files (CLAUDE.md, docs/api.md, etc.)
- `tools/list_routes`: List available API routes

This prevents accidental reads outside the project and keeps the server focused on its intended use case: providing API and documentation context, not general file access.

**Usage example:** The server enables Claude to answer questions like "What's the project structure?" or "Show me the API endpoints" by reading from committed documentation.

---

## 2. Skill: Express Route Pattern

**Repeated pattern captured:** Creating new Express routes following the project's conventions.

**Description wording:** "Triggered when the user asks to create a new Express route or endpoint." This fires specifically on requests like "create a new route", "add an endpoint", or "write a new resource handler" — common requests when extending the API.

**How the skill works:** When triggered, it:
1. Ensures one file per resource (follows `routes/users.js` pattern)
2. Validates input in the route layer (400 on validation failures)
3. Uses the standard error format: `{ error: "message" }`
4. Suggests mounting in `server.js` under the resource name
5. Provides a test template

**Confirmation:** The skill fires on requests to create new routes and guides Claude to match the existing codebase patterns.

---

## 3. Command: /review-route

**Purpose:** A reusable shortcut for reviewing route files against project standards.

**Usage:** `/review-route $1` (takes a file path like `routes/users.js`)

**Why it's worth a shortcut:** Route reviews are frequent during development, and this command encodes the project's specific standards (error format, status codes, validation placement). Without the shortcut, Claude would need to rediscover these patterns each time. With it, teams stay consistent.

**What it checks:**
- Error response format: `{ error: "message" }`
- HTTP status codes (400, 404, 201)
- Validation in the route, not elsewhere
- Proper router export
- RESTful conventions

---

## 4. Hook: Route File Modification Alert

**Event:** `PostToolUse` (runs after edits)

**Matcher:** Watches edits to files matching `routes/**/*.js`

**Command:** Prints a reminder about the error response format standard

**Why this matters:** The error response format is a critical convention in this project. The hook ensures that whenever a route is edited, Claude and the developer get a reminder to maintain consistency. This prevents accidental deviations like forgetting to wrap error messages in `{ error: "..." }`.

**Does it react or prevent?** It *reacts* (PostToolUse) with a reminder rather than preventing the edit, allowing flexibility while maintaining awareness.

---

## 5. Headless Task & Allowed Tools

**What was run headless:** Creating a new "orders" resource route (POST/GET/PUT endpoints) with full test suite, all without human supervision.

**What I locked down (allowed tools only):**
- `Read` — inspect existing routes to understand patterns
- `Write` — create new route file (routes/orders.js) and test file (tests/orders.test.js)
- `Edit` — modify store.js and server.js to support orders
- `Bash` — run npm test to verify everything works

By pre-approving only these four tools, Claude couldn't delete files, modify config, or make risky changes. The Express Route Pattern skill automatically guided it to follow conventions. Result: 12 new tests passed, 0 human intervention needed.

---

## 6. Files Committed

- `.mcp.json` — Project-scope MCP server configuration with permission rules
- `.claude/mcp-server.js` — The Node.js MCP server implementation
- `.claude/skills/express-route/SKILL.md` — Route creation pattern skill
- `.claude/commands/review-route.md` — Route review command
- `.claude/settings.json` — Hook configuration for route file changes
- `NOTES.md` — This file, explaining all choices

---

## Summary

This project integrates Claude into the workflow at four levels:
1. **Server** — Centralizes access to documentation
2. **Skill** — Automates adherence to routing conventions
3. **Command** — Saves time on routine reviews
4. **Hook** — Enforces error-format standards on every edit

Together, these ensure that any developer (human or Claude) working on this project follows the same patterns and maintains the codebase quality.
