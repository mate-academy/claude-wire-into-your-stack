---
name: reuse-functions
description: Scan the codebase for duplicate or near-duplicate functions, consolidate them into single reusable versions, update every call site, verify no errors were introduced, and report a checklist of results. Use when the user says things like "make sure to reuse functions", "cleanup functions", "consolidate duplicates", "DRY up the code", "remove duplicate functions", or similar.
---

## When to invoke

Use this skill when the user asks to deduplicate, consolidate, or DRY up functions across the codebase. Common triggers:

- "make sure to reuse functions"
- "cleanup functions"
- "consolidate duplicates"
- "DRY up the code"
- "remove duplicate functions"
- "find and merge similar functions"
- "refactor repeated logic"

Invoked as: `/reuse-functions`

## Workflow

### Step 1 — Orient

Read `CLAUDE.md` to understand:
- The project's directory layout and which directories contain source code.
- What test command to run (used in Step 5).
- Any architectural constraints (e.g., "all data access goes through `db/store.js`").

### Step 2 — Discover candidate duplicates

Use Grep and Read to collect all function definitions across source files. For each file in the source directories:

- Extract every named function (declarations, expressions, arrow functions assigned to `const`/`let`, class methods, exported helpers).
- Note the file path, function name, parameter list, and body.

Group functions into **candidate duplicate sets** using these signals (all are soft — use judgment):

1. **Identical or near-identical body** — same logic, possibly different variable names.
2. **Same purpose inferred from name** — e.g., `getUser` / `fetchUser` / `findUser` that all look up a record by ID.
3. **Same input/output shape** — same parameter count and types, same return structure.
4. **One is a strict subset of another** — one function does A, another does A + B where B is generic enough to extract.

Ignore functions that are intentionally different despite similar names (e.g., `validateEmail` vs `validatePhone` — same shape, different domain).

### Step 3 — Plan consolidations

For each candidate set, decide:

- **Where the canonical function will live** — prefer the file that already owns the most related logic (e.g., a utility module, a store, a shared helper file). Create a new shared file only if no good home exists.
- **What the canonical signature will be** — the most general signature that all callers can satisfy.
- **What name the canonical function will have** — prefer the most descriptive existing name; rename only if none of the existing names are clear.

Do not start writing code yet. List the planned consolidations and confirm the plan is sound before proceeding. If a consolidation is risky or ambiguous, note it as **Needs Review** and skip it — do not guess.

### Step 4 — Implement

For each planned consolidation:

1. **Write the canonical function** in its chosen home file. Preserve all behavior of the original functions. Do not add new behavior.
2. **Remove the duplicate(s)** — delete the old function bodies entirely (do not leave stubs or aliases unless callers are in external packages outside this repo).
3. **Update every call site** — grep for all usages of the old function name(s), update each import and each call to use the canonical function and its new location.
4. Check that the canonical function's export is reachable from every updated call site (correct import path, named vs. default export, etc.).

Work one consolidation at a time. Do not batch multiple consolidations into a single edit — this makes errors easier to isolate.

### Step 5 — Verify

After all consolidations are applied, run the project's test command from `CLAUDE.md`. If no test command is documented, run `npm test` as a default.

For each consolidated function:
- Check that at least one test exercises a caller of the canonical function.
- If a test fails, identify whether the failure is in the canonical function itself or in a call site that was not correctly updated, fix it, and re-run.

Do not mark a consolidation as verified until the full test suite passes with no new failures.

### Step 6 — Report

Print a checklist in this exact format:

```
## Function Consolidation Report

Consolidated N duplicate group(s) into N reusable function(s).

| # | New canonical function | Replaced | Location | Tests |
|---|------------------------|----------|----------|-------|
| 1 | `functionName(params)` | `oldA`, `oldB` | `path/to/file.js` | ✅ |
| 2 | `functionName(params)` | `oldC` | `path/to/file.js` | ✅ |

### Skipped (Needs Review)
- `funcX` vs `funcY` — [reason it was too ambiguous to consolidate safely]
```

Use ✅ when the test suite passed after that consolidation. Use ⚠️ if the tests pass overall but no test directly exercises that function (note this so the user can add coverage). Use ❌ only if a failure remains unresolved — and if that happens, do not mark the task complete.

## Guardrails

- **Do not change behavior.** Consolidation is a structural refactor only. If making the function general requires adding a new parameter with a default, that is acceptable — silently changing what a function computes is not.
- **Do not rename call sites** beyond what is required to point to the canonical function.
- **Do not consolidate across trust boundaries** (e.g., do not merge a client-side helper with a server-side one even if they look identical — they may diverge intentionally).
- **Skip anything ambiguous** — list it in "Needs Review" and let the user decide.
- **Never commit.** Committing is the user's responsibility.
