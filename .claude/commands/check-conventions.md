---
description: Check changed or given files against this project's route conventions
argument-hint: [optional file or folder to focus on]
---
Scope: if "$ARGUMENTS" is not empty, review only $ARGUMENTS. Otherwise review all uncommitted work — run `git status` and `git diff HEAD`, and also read any untracked files.

Check each file against the conventions in CLAUDE.md:
- one router file per resource, mounted in server.js under its base path
- all data access goes through db/store.js
- 400 on bad input, 404 when a record is missing
- every error response is JSON `{ "error": "message" }`
- new behaviour has tests covering success, 400 and 404

Report each issue as: file:line — problem — suggested fix.
End with a single line: PASS or FAIL.