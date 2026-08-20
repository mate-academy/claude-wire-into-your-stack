---
description: Check docs/api.md against the real routes and update it to match
---

Use the `docs` MCP server to read `docs/api.md`. Then read every route file
in `routes/` and compare each endpoint's method, path, status codes, and
request/response shape against what `docs/api.md` says.

List any mismatches you find: endpoints that are undocumented, documented
endpoints that no longer exist, or details (status codes, required fields,
response shape) that differ from the code.

If an argument is given — $ARGUMENTS — focus only on the route file at that
path; otherwise check all of them.

Update `docs/api.md` so it matches the code exactly, keeping its existing
style and structure. If nothing is out of date, say so and leave it alone.
