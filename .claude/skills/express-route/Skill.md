---
description: Create or update Express API endpoints following the project standard (JSON response structure, try-catch handling, and 400/500 status codes). Trigger whenever asked to add, write, or build an API route or endpoint.
---

# Express Route Standard

When creating or modifying Express routes in this project:
1. Always wrap asynchronous handlers in `try/catch` blocks.
2. Return success responses in `{ success: true, data: ... }` format.
3. Return error responses in `{ success: false, error: "Message" }` format with appropriate status codes (400 for bad input, 500 for server error).
4. Keep route definitions modular and use standard ES module/CommonJS exports matching the repo.