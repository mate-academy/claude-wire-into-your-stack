---
name: create-route
description: Create or modify an Express API route following this project's route conventions. Use when adding a new endpoint, resource route, or Express route to this project.
---

# Create a Route

When creating or modifying an Express route in this project:

1. Put each resource in its own file under `routes/`.
2. Export an Express router from the route file.
3. Mount the router in `server.js` under the appropriate base path.
4. Keep data access in `db/store.js`; routes must not hold application state directly.
5. Validate request input in the route.
6. Return HTTP 400 for invalid input.
7. Return HTTP 404 when the requested record does not exist.
8. Return errors as JSON in this shape:

```json
{
  "error": "message"
}