---
description: Review changes against the Course API conventions checklist (store access, routing, 400/404 errors, tests, docs)
argument-hint: "[git ref or range — default: uncommitted changes vs HEAD]"
allowed-tools: Bash(git diff:*), Bash(git log:*), Bash(git status:*), Read, Glob, Grep, mcp__docs__read_text_file
---

Review code changes in this repo against the project's conventions from CLAUDE.md.

**What to review:** if `$ARGUMENTS` is empty, review uncommitted changes (`git diff HEAD` plus untracked files from `git status`). Otherwise treat `$ARGUMENTS` as a git ref or range (e.g. `main...HEAD`, `HEAD~1`) and review `git diff $ARGUMENTS`.

Read every changed file in full, not just the diff hunks. Read `docs/api.md` through the `docs` MCP server (`mcp__docs__read_text_file`).

Check each item and mark it ✅ pass, ❌ fail or ➖ n/a:

1. **Store only** — routes never hold state; all data access goes through `db/store.js` helpers.
2. **One route file per resource** — each resource lives in `routes/<resource>.js` and is mounted in `server.js` under its base path.
3. **Validation → 400** — bad or missing input returns `400`.
4. **Missing record → 404** — lookups that find nothing return `404`.
5. **Error shape** — every error response is `res.status(...).json({ error: 'message' })`.
6. **Tests** — every new/changed endpoint has `node:test` + supertest coverage in `tests/`, including its 400/404 branches, with `store.reset()` in `beforeEach`.
7. **Docs** — `docs/api.md` describes every new/changed endpoint and matches the implemented status codes.

Output:

- A checklist table: `# | Check | Result | Evidence (file:line)`.
- Then a short **Must fix** list (❌ items, most important first) with a concrete fix for each.
- If there are no route/store/test/doc changes at all, say so in one line and skip the table.

Do not edit any files — this is a review only.
