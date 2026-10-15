---
description: Review a route, file, or the current changes against this project's route checklist
---

Review the following target against this project's route conventions: $ARGUMENTS

If no target is given, review the current uncommitted changes (`git diff` / `git status`).

Check against this checklist:
- Input validation — required fields are checked; invalid/missing input returns `400`.
- HTTP status codes — correct code per outcome (`200`, `201`, `400`, `404`, etc.), matching how nearby routes use them.
- JSON error response shape — errors are `{ "error": "message" }`, matching the project's existing shape exactly.
- Data access through `db/store.js` — the route never holds state or touches storage directly; all reads/writes go through the store helpers.
- Consistency with nearby routes — structure, naming, and style match the other routes in the same file / `routes/` directory rather than inventing new patterns.
- Relevant tests — a test exists (or is missing) for each behavior above, following the style of existing tests in `tests/`.

Report findings only, grouped by checklist item, each with a file:line reference and a one-sentence explanation of the gap (or confirmation it's covered). Do not edit, create, or delete any files.
