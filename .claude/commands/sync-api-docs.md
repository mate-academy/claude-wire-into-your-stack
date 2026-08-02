---
description: Compare docs/api.md against the actual routes and fix any drift
---

Read every router in `routes/` and compare it against `docs/api.md`.

For each endpoint, check that the doc accurately reflects the code:

- the HTTP method and path
- the request body shape (which fields are required vs optional)
- the response shape and status codes, including error cases

Update `docs/api.md` in place to fix anything that has drifted — missing
endpoints, wrong status codes, stale field names, outdated examples. Keep the
existing doc's structure and tone (same heading levels, same JSON-block style).
If nothing has drifted, say so and make no changes.
