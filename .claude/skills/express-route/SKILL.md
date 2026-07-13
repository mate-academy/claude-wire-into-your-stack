---
name: express-route
description: Apply the Course API route conventions when adding or modifying an Express endpoint, including route-level validation, store-based data access, JSON errors, and tests. Use when the user asks to create, update, fix, or review an API route in this repository.
---

# Course API route conventions

When adding or modifying a route:

1. Keep one router per resource in `routes/`.
2. Mount new routers from `server.js`.
3. Access application data only through `db/store.js`.
4. Validate request input inside the route.
5. Return `400` for invalid input.
6. Return `404` when the requested record does not exist.
7. Return errors as:

```json
{ "error": "message" }
```
