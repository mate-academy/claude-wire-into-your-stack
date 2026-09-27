# MCP Server Configuration

## Which server did you connect?
**@anthropic-ai/mcp-server-filesystem** — Anthropic's built-in filesystem MCP server

## Why is it useful here?
The filesystem server provides structured access to the project's documentation and source files. For this Course API, it allows Claude to directly read:
- API reference documentation (`docs/api.md`)
- Source code structure (`routes/`, `db/store.js`, etc.)
- Test files and configuration

This enables Claude to answer questions about the API, understand endpoint signatures, and reference implementation details without manual context-passing.

## What did your permission rule allow?
The permission rule restricts the filesystem server to **read-only operations**:
- `read_file` — read file contents
- `list_directory` — list directory contents

This prevents any write, delete, or modification operations, keeping the server safe and scoped to information retrieval.

## Configuration Location
- Server definition: `.mcp.json`
- Permission rules: `.claude/settings.json`
- Root path: project root (`.`) — exposes all project files

---

# Project Skills

Two project skills teach Claude about core conventions used in this repository.

## Skill 1: Test Structure Convention
**File:** `.claude/skills/test-structure.md`

**What it captures:** How tests are structured using Node's `test` module, `supertest` for HTTP requests, and `node:assert` for assertions. Includes patterns for setup with `test.beforeEach()`, making requests, checking `res.status` and `res.body`, and naming conventions.

**How it fires:** Triggered when writing or reviewing test cases, adding tests, debugging test failures, or explaining test patterns. Keywords: "write test", "test case", "test fails", "review test", "test structure", "add test".

**Example trigger:** User asks "I need to write a test that verifies the PUT endpoint returns 404 when the user doesn't exist. What should the test look like?" → skill automatically provides the `test()` pattern, `supertest` usage, and assertion examples.

---

## Skill 2: Error Response Format Convention
**File:** `.claude/skills/error-response-format.md`

**What it captures:** The standard error response format (`{ "error": "message" }`), HTTP status codes (400 for validation, 404 for not found, 201 for created), and the implementation pattern using early `return` statements. Teaches consistency in error handling across all routes.

**How it fires:** Triggered when handling errors, returning error responses, reviewing error handling code, working with error formats, or checking API error behavior. Keywords: "error response", "error handling", "return error", "404", "400", "error message", "error format".

**Example trigger:** User asks "I'm adding a delete endpoint. If the user doesn't exist, what should the error response look like?" → skill automatically provides the error JSON shape, 404 status code, and implementation pattern.

---

# Custom Command

## Command: Summarize Changes (`.claude/commands/summarize-changes.md`)

**What command did you add?**
`summarize-changes` — a dual-mode command that summarizes repo changes and optionally scaffolds new routes.

**What makes it worth a shortcut?**
This command is run repeatedly during development because it:
1. **Quick status check** — instantly see what changed (commits, files, staged vs unstaged) without manual git commands
2. **Dual functionality** — one shortcut handles two tasks:
   - `summarize-changes` (no input) → summarize all recent changes in the repo
   - `summarize-changes products` (with route name) → summarize changes + scaffold a new `routes/products.js` with full boilerplate
3. **Follows project conventions** — the scaffold automatically includes:
   - Express router setup matching the project's style
   - Error handling with the standard `{ "error": "message" }` format
   - Example GET, GET/:id, and POST endpoints
   - TODO comments for customization points
   - Reminder to wire up store methods and tests

**How it works:**
- **Mode 1 (no args):** Runs `git log`, `git diff --stat` to show branch state, recent commits, and what files changed
- **Mode 2 (with $ARGUMENTS):** Does mode 1 + generates a new route file with the argument as the resource name

**Example:**
- `/summarize-changes` → summarizes the 3 commits we just made (MCP server, skills, command)
- `/summarize-changes articles` → summarizes changes + creates `routes/articles.js` scaffold ready to customize

**Why it saves time:**
Instead of running `git status`, `git log`, remembering the route structure, and manually creating boilerplate, this one command does it all—making it natural to run frequently during feature development.

---

# Hook Configuration

## Hook: Auto-Lint on Code Edits

**Configuration:** `.claude/settings.json`

**What hook did you set?**
`npm run lint` — auto-lint the code whenever a file is edited

**Does it react or prevent?**
**REACT** (PostToolUse event) — runs AFTER an edit or write is complete, not before. This ensures the code is already saved, then linting runs to check and fix style issues automatically.

**On which event?**
**PostToolUse** — reactive hook that fires after the Edit or Write tools finish

**Matcher:** `Edit|Write` — triggers on both code edits and file writes

**Why it's useful:**
- **Auto-cleanup** — linting happens automatically without manual `npm run lint` commands
- **Consistent style** — every edit triggers a style check, keeping code uniform throughout development
- **Saves time** — no context switch to run linting; the hook does it in the background
- **Catches issues early** — lint errors are surfaced immediately after changes, not at commit time

**How it works:**
1. User edits a file with the Edit tool
2. Edit completes (file is saved)
3. Hook fires: `PostToolUse` event is triggered
4. `npm run lint` runs automatically
5. Any linting issues are fixed or reported

**Example workflow:**
```
User: Edit routes/users.js (fix a bug)
  → Edit tool completes
  → PostToolUse:Edit hook fires
  → npm run lint runs automatically
  → Code is checked/formatted
  → User continues working with clean code
```

**Configuration format:**
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npm run lint"
          }
        ]
      }
    ]
  }
}
```

---

# Headless Task Execution

## Headless Run: Test Suite Validation

**What did you run headless?**
Ran the full test suite with `npm test` via Claude in headless mode (`-p` flag), allowing only the Bash tool.

**What did you lock down?**
Restricted to **Bash tool only** — no Edit, Write, Read, or other tools allowed. The --allowedTools flag ensured:
- ❌ NO code edits possible (Edit blocked)
- ❌ NO file writes possible (Write blocked)  
- ❌ NO file reads possible (beyond command output)
- ✅ ONLY: Shell execution for tests

**Why this set is safe:**
- **Read-only execution** — running tests doesn't change code
- **Deterministic** — tests just verify existing behavior
- **No side effects** — npm test is contained, no external writes
- **Easily auditable** — Bash tool is the only permission needed
- **Fail-safe** — if tests fail, nothing broke; only output is reported

**Command executed:**
```bash
echo "Run the test suite for the Course API with npm test and report the results." | claude -p --allowedTools Bash
```

**Results:**
✅ All 5 tests passed
- GET /users returns the seeded list
- GET /users/:id returns 404 for a missing user
- POST /users creates a user
- PUT /users/:id updates an existing user
- PUT /users/:id returns 404 for a missing user

**Why this pattern is valuable:**
- **Zero human supervision needed** — can run in CI/CD pipelines
- **Tight security** — only one tool allowed, can't go rogue
- **Verifiable** — exact tools locked down and documented
- **Repeatable** — same command, same result, no surprises
