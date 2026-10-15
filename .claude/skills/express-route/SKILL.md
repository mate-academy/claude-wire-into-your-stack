---
name: express-route
description: Use when creating or modifying an Express API route or endpoint in this repository, including request validation, HTTP status codes, error responses, or route tests.
---

# Express Route Conventions

When creating or modifying an API route in this repository, follow these rules.

## Architecture
- Keep one route file per resource under `routes/`.
- Mount resource routers in `server.js` under the appropriate base path.
- Route handlers must use `db/store.js` for data access.
- Do not store or manipulate persistent resource data directly in route handlers.

## Request validation and responses
- Validate request parameters and body fields before accessing data.
- Return HTTP 400 for invalid input.
- Return HTTP 404 when the requested resource does not exist.
- Use HTTP 201 when a resource is successfully created.
- Return errors as JSON in the form `{ "error": "message" }`.
- Preserve the existing response format and conventions of the relevant route.

## Tests
- Inspect the existing tests before changing a route.
- Add or update tests for successful requests, invalid input, and missing resources where applicable.
- Use the project's existing test runner: `npm test`.
- Run the relevant tests after making changes.

## Workflow
1. Inspect a similar route and its tests before coding.
2. Make the smallest change consistent with the existing architecture.
3. Check that the router is mounted correctly if a new resource is introduced.
4. Run tests and report their results.
5. Do not modify unrelated files.
