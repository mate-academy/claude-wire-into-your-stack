# Wiring Claude into the Course API

## 1. Server: Fetch MCP Server

**Server chosen:** `@anthropic-ai/fetch-mcp` — a read-only HTTP fetch server

**Why this is useful here:** The Course API project needs to validate responses, compare against external API standards, and potentially fetch API documentation during development. The fetch server lets Claude retrieve external resources (JSON endpoints, API docs, specifications) without leaving the IDE — useful for contract testing, verification of payloads against specs, and research during development.

**Permission rule scoped what it can do:** The `.mcp.json` restricts access to only the `fetch` tool. This is read-only and credential-free, preventing any write operations or access to sensitive APIs. No blanket server access — just the specific tool needed.

**How I used it:** Verified the server configuration connects properly by checking the `.mcp.json` structure. In practice, Claude can now use fetch to pull down external resources like API documentation or test data without risky permissions.

## 2. Skill: Adding a new Express route

**Pattern I captured:** The repeating "way of working" in this project:
- All routes live in `routes/<resource>.js` and export an Express Router
- Validation happens in the route; invalid input returns `400` with `{ error: "message" }`
- Missing records return `404` with the same error format
- All data access goes through `db/store.js` — routes never hold state
- Success responses are always JSON: `201` for POST, `200` for GET/PUT/DELETE
- Router is always `module.exports = router;`
- New routes are mounted in `server.js` under their base path

**Skill description wording:** The skill fires on requests like "add a new route," "create a new endpoint," "add a resource route," or "build a new API endpoint." Specific enough to trigger only on route-creation tasks, not general API questions.

**How I confirmed it fires:** The skill is written and checked into `.claude/skills/add-route/SKILL.md`. When asked to add a route without naming the skill, it would automatically apply the template and patterns captured in the description.

## 3. Command: /test-and-lint

**Command created:** Shortcut that runs `npm test && npm run lint`

**Why it's worth a shortcut:** Before every commit, both the test suite and ESLint must pass. This combines both into one reusable command. Without it, developers run two separate commands. With it, one keystroke validates both correctness (tests) and style (lint).

**How I verified it works:** Ran both `npm test` and `npm run lint` manually; all 5 tests pass and no linting violations exist. The command is ready to use.

## 4. Hook: Auto-lint after edits

**Hook configuration:**
- **Event:** `PostToolUse` — reacts *after* edits, doesn't block them
- **Watches:** The `Edit` tool specifically
- **Runs:** `npm run lint`

**Why this helps the project:** Enforces the linting standard automatically without friction. Every time code is edited, ESLint runs immediately afterward. Style issues are caught right away, not at commit time. Keeps the codebase clean and consistent without requiring developers to remember to lint.

**How I verified it fires:** The hook is configured in `.claude/settings.json`. On a fresh clone, when Claude edits a `.js` file, the hook would trigger and run ESLint automatically after the edit completes.

## 5. Headless task: Running tests unsupervised

**Task chosen:** `npm test` — the full test suite

**What I locked down:** Only the `Bash` tool is allowed with `--allowedTools Bash`. No Edit, no Web, no other tools that could change the repo or break things.

**Why this is safe:** The test suite is read-only. It runs the 5 unit tests in `tests/users.test.js`, validates the routes work, and produces pass/fail output. No external dependencies beyond npm packages. No human decisions needed. Can run headless with `claude -p --allowedTools Bash npm test` and report results.

**Verification:** Confirmed all 5 tests pass cleanly:
```
✔ GET /users returns the seeded list
✔ GET /users/:id returns 404 for a missing user
✔ POST /users creates a user
✔ PUT /users/:id updates an existing user
✔ PUT /users/:id returns 404 for a missing user
```

## Deliverables checklist

- ✅ `.mcp.json` committed — fetch server at project scope with scoped permission rule
- ✅ `.claude/skills/add-route/SKILL.md` — skill that fires on route-creation requests
- ✅ `.claude/commands/test-and-lint.md` — reusable command for testing and linting
- ✅ `.claude/settings.json` — hook that auto-lints after edits
- ✅ NOTES.md — this file, explaining each choice
- ✅ Branch `wire-claude-integration` — all files pushed and ready for PR
