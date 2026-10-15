---
description: Create or update Express routes in this repo using the project conventions: route-per-resource in routes/, store access through db/store.js, 400 for bad input, 404 for missing records, JSON errors shaped as { "error": "message" }, and node:test + supertest coverage.
---

# Express Route Pattern

Use this skill when asked to add or change API endpoints in this repository.

## Required implementation pattern

1. Keep one resource per file in routes/ and mount the router in server.js.
2. Validate request input in the route handler.
3. Return 400 for invalid input and 404 when a record is missing.
4. Return error responses as JSON in this shape: { "error": "message" }.
5. Read/write data only through db/store.js. Do not keep route state in-memory inside route files.
6. Add or update tests in tests/ using node:test, node:assert, and supertest.

## Route checklist before finishing

- Endpoint path and method match the request.
- Success status code is correct (for example 201 on create).
- Error paths are covered and return JSON error payloads.
- Existing behavior is not regressed.
- Tests pass with npm test.
