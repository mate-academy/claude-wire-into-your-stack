---
description: Reconcile docs/api.md with the actual routes and fix any drift
---

Bring `docs/api.md` back in sync with the code. Do **not** change any code — only
`docs/api.md`.

Scope: if `$ARGUMENTS` names a resource (e.g. `users`), only reconcile that
section. Otherwise check every router under `routes/`.

For each route handler, verify `docs/api.md` documents it correctly:

- HTTP method and path
- required and optional request-body fields
- every status code the handler can return (`200`, `201`, `400`, `404`, …)
- the response shape, including the error shape `{ "error": "message" }`
- the resource's object shape, if the docs show one

Then edit `docs/api.md` to fix what's wrong or missing:

- add endpoints that exist in code but aren't documented
- correct wrong methods, paths, status codes, or field lists
- update stale request/response examples
- remove entries for routes that no longer exist

Match the existing doc style — `##` / `###` headers, fenced ```json examples, the
"Base URL" and error-shape notes at the top. Keep the ordering (Health, then
Users, then others).

Finish with a short summary of what changed, or "docs already in sync" if nothing
needed fixing.
