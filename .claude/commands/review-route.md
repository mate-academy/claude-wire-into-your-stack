---
description: Review one endpoint against this project's route checklist
argument-hint: "<METHOD /path>, e.g. PUT /users/:id"
---
Review the endpoint **$ARGUMENTS** in this repo against the project checklist. Read its handler in `routes/`, the store helpers it calls in `db/store.js`, its tests in `tests/`, and its entry in `docs/api.md`.

Answer each line with PASS, FAIL or N/A, and give file:line evidence for each FAIL:
1. Data access only through `db/store.js` - no state held in the route.
2. Unknown id -> `404 { "error": ... }`; bad input -> `400 { "error": ... }`; no unhandled crash for a non-numeric id.
3. Correct success status (201 create / 200 read-update / 204 delete).
4. Tests cover success, 404 and 400 using supertest + `store.reset()`.
5. `docs/api.md` matches the actual behaviour (fields, status codes).

End with the single most important fix, if there is one. Do not edit files - report only.
