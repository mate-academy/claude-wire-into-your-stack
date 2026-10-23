---
description: Review API changes against the conventions in CLAUDE.md
argument-hint: [path-or-nothing]
---

Review code against this project's conventions. Do not edit any files; report only.

**What to review**
- If `$ARGUMENTS` is given, review that file.
- Otherwise, review the changes on this branch: run `git diff main...HEAD` (and `git status` for uncommitted work).

**Check against the conventions in CLAUDE.md**
- Bad input returns `400`.
- Missing record returns `404`.
- Error responses are JSON shaped `{ "error": "message" }`.
- Data access goes only through `db/store.js`; routes hold no state.
- Tests are added or updated for the change.
- `docs/api.md` is updated for the change.

**Report**
A short list of findings, one per line, as `file:line — problem`. Group nothing, add no praise. If everything conforms, say so in one line.
