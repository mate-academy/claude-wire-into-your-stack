---
name: api-route
description: Create or update an Express API route in this project, including validation and consistent JSON error responses. Use when adding an endpoint or changing route behavior.
---

Follow the existing project conventions when changing an API route:

1. Keep one resource per file in `routes/` and export an Express router.
2. Read and write application data only through `db/store.js`.
3. Validate request input before calling the data layer.
4. Return `400` for invalid input and `404` for missing records.
5. Format errors as `{ "error": "message" }`.
6. Add or update focused tests in `tests/` and run `npm test` and `npm run lint`.

Return a short summary of the route behavior, files changed, and verification results.
