# Project Integration Notes

## 1. MCP Server (Fetch)

**Chosen:** Fetch server with read-only permissions

**Why:** This Express API benefits from real-time validation. The fetch server lets Claude test endpoints as it writes them (`GET /health`, `GET /users`, `GET /users/:id`). This is essential for development—write route, test immediately, validate patterns work.

**Permissions rule:** Scoped to three endpoints: health check, list users, fetch one user. No writes, no deletes—read-only ensures safety in headless mode.

---

## 2. Skill (route-pattern)

**Captured:** How routes are structured in this project

**Description triggering:** "Écrire une nouvelle route Express suivant les conventions du projet" — specific enough to fire on route-writing requests, not on unrelated tasks.

**Confirmed:** Claude added DELETE /users/:id unprompted and followed all patterns: validation before store call, 404 with `{ "error": "..." }` on missing user, early return, tests included, all tests pass.

---

## 3. Custom Command (/check)

**Command:** `npm test` && `npm run lint`

**Why it's a shortcut:** Before committing or validating work, we need tests green and lint clean. Running both together after every edit is repetitive. The `/check` command bundles both into one invocation, and the hook auto-runs it after edits, surfacing any regressions immediately.

---

## 4. Hook (PostToolUse on str_replace)

**Event:** PostToolUse
**Matcher:** str_replace (after any file edit)
**Action:** Runs `/check` command

**Rationale:** Catch regressions early. Every file edit risks breaking tests. Auto-checking after writes means no broken state lingers. This keeps the codebase always-passing.

---

## 5. Headless Task

**Task:** Added route GET /users/:id/stats (name and email character counts)

**Locked tools:** `--allowedTools str_replace,bash_tool`

**Why these two:** str_replace edits routes and tests, bash_tool runs npm test to validate. Fetch would be nice but isn't required—we test with npm test instead. No create_file needed (routes already exist). No browser, no shell escapes.

**Result:** 9/9 tests pass, lint clean, route follows all conventions (skill auto-triggered, validation, 404, error format). Claude stayed within boundaries.

---

## 6. Summary

- Server: Fetch, read-only, scoped to safe endpoints
- Skill: Route patterns encoded and auto-triggers
- Command: /check bundles common validation
- Hook: Auto-checks after edits, catches regressions
- Headless: One real task, locked tools, all tests pass
- Repo is now self-wiring: next person clones, gets Claude configured, ready to work

