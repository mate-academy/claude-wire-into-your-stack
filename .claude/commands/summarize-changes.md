---
name: summarize-changes
description: Summarize what changed in this repo since last commit or main branch
---

# Summarize Changes

Generate a concise summary of changes in the repository.

## Usage

```
/summarize-changes [--since <ref>]
```

Default compares against `HEAD` (uncommitted changes). Use `--since main` to compare against main branch.

## What It Shows

1. **Modified files** — list with brief description of changes
2. **New files** — what was added
3. **Deleted files** — what was removed
4. **Key diffs** — highlights for route, store, test changes
5. **Test impact** — whether new tests were added or existing ones modified

## Output Format

```
## Changes Since <ref>

### Modified
- `routes/users.js` — added PUT /users/:id endpoint
- `db/store.js` — added updateUser helper

### Added
- `tests/users.test.js` — test suite for users routes

### Deleted
- (none)

### Test Status
- All tests pass (npm test ✓)
- Lint passes (npm run lint ✓)
```