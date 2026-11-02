---
description: Review a file or the current diff against Course API conventions
argument-hint: [file path, or empty for the current git diff]
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(npm test), Bash(npm run lint)
---
Review $ARGUMENTS (if empty — the output of `git diff main`) against the conventions in CLAUDE.md:
- one route file per resource, mounted in server.js
- all data access through db/store.js, no state in routes
- 400 on bad input, 404 on missing record
- errors are `{ "error": "message" }`
- tests exist in tests/ for success, 400 and 404 cases
- docs/api.md is updated
Then run `npm test` and `npm run lint`.
Output a checklist: ✅/❌ per item with file:line for every ❌, and a one-line verdict. Do not edit files.