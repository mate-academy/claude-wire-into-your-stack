---
description: Check whether docs/api.md matches the actual routes in routes/*.js and db/store.js, and report any drift.
allowed-tools: Read, Grep, Glob, mcp__docs-filesystem__read_file, mcp__docs-filesystem__read_multiple_files
---

Audit `docs/api.md` against the live implementation. This is a read-only
check — do not edit any files, just report.

1. Read `docs/api.md` (prefer the `docs-filesystem` MCP server's
   `read_file`/`read_multiple_files` tools for anything under `docs/`).
2. Read every file in `routes/` and `db/store.js`.
3. For every route (method + path) implemented in `routes/`, confirm
   `docs/api.md` documents it with matching method/path, request body
   requirements, response status codes, and the error shape
   (`{ "error": "message" }`).
4. Flag: routes implemented but undocumented, routes documented but no
   longer implemented, or mismatched status codes/fields.
5. Report "in sync" or a bullet per drift found, naming the file and what's
   wrong. Do not modify any files.

$ARGUMENTS
