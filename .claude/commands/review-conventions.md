---
description: Review the working tree diff (or a given path) against this repo's route/error/data-access conventions from CLAUDE.md
---

Review the current changes for convention violations against `CLAUDE.md` and this repo's established patterns.

Scope: $ARGUMENTS (if empty, review `git diff` plus `git diff --staged`; if a path or PR-like description is given, review that instead).

Check specifically for:
- Every route file lives under `routes/`, one file per resource, mounted in `server.js` under its base path.
- All data access goes through `db/store.js` — no route holds state directly.
- Input is validated in the route: `400` on bad/missing input, `404` when a looked-up record doesn't exist.
- Error responses are JSON shaped exactly `{ "error": "message" }`.
- New or changed endpoints are reflected in `docs/api.md`.
- Tests exist under `tests/` for new behavior (success case and the relevant error case).

Report findings as a short list: file, line if applicable, what's wrong, and the minimal fix. If nothing violates convention, say so briefly — don't invent issues.
