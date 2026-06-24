---
description: Review the diff against this repo's API conventions checklist
---

Run `git diff $ARGUMENTS` (default to `main` if no argument is given, i.e. `git diff main`) and review the changed `routes/`, `db/store.js`, and `tests/` code against this project's checklist:

- Data access goes through `db/store.js` only — routes never hold state directly.
- Bad/missing input returns `400`; a missing record returns `404`.
- Every error response is JSON shaped `{ "error": "message" }`.
- Every new/changed route has a matching test in `tests/` covering the success path and the `400`/`404` paths.
- `docs/api.md` is updated to match any new or changed endpoint.

Report each violation with the file and line, and call out anything that looks correct but is untested. Do not edit any files — this is a read-only review.
