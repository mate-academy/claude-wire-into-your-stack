---
name: api-routes
description: Use when creating or modifying Express API routes in this project, especially when adding endpoints, validating request input, or changing route behavior.
---

# API Route Conventions

When working on an Express route in this project:

- Keep one resource per route file under `routes/`.
- Keep all data access in `db/store.js`; routes must not hold application state directly.
- Validate request input in the route.
- Return HTTP 400 for invalid input.
- Return HTTP 404 when a requested record does not exist.
- Return JSON error responses in the shape `{ "error": "message" }`.
- Follow the existing Express router style and keep handlers small and focused.
- Add or update tests for changed endpoint behavior when the task calls for implementation changes.
