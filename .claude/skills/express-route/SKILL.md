---
name: express-route
description: Best practices for creating or modifying Express API routes, validating input, and handling errors.
---
When working with routes in this project:
- Always validate input and return 400 for bad input.
- Use db/store.js for all data persistence.
- Return 404 when a record is missing.
- Format error responses as JSON in the shape `{ "error": "message" }`.