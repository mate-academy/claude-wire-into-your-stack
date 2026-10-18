---
name: api-route
description: Use when implementing, updating, or reviewing Express API routes in this repository, especially endpoints that interact with the user data store or require tests.
---

# API Route Development

When implementing or updating an API route in this repository:

1. Read `CLAUDE.md`, `docs/api.md`, and the relevant existing route files before making changes.
2. Follow the repository's existing Express 4 and CommonJS conventions.
3. Inspect `db/store.js` to understand the available data operations. Do not assume a method exists without verifying it.
4. Validate request parameters and request bodies consistently with existing routes.
5. Return appropriate HTTP status codes and JSON responses, following the documented API contract.
6. Add or update tests using the repository's existing test framework and conventions.
7. Run the relevant tests and report their actual results. Do not claim tests passed unless they ran successfully.
8. Keep changes focused on the requested endpoint. Do not modify unrelated files or dependencies.
9. Summarise the files changed, behaviour implemented, and any remaining issues.
