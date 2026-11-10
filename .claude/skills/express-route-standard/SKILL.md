---
name: express-route-standard
description: Use this skill whenever creating or modifying a new Express route, controller, or endpoint in this project to follow the standard error handling, validation, and response format.
---

# Express Route Development Standard

When adding or updating routes in this repository:
1. **Controller separation:** Keep route declarations clean; move business logic into controllers.
2. **Error handling:** Wrap async route handlers in a try/catch block or use an async wrapper middleware, returning JSON responses with standard format: `{ "success": false, "error": "message" }`.
3. **Validation:** Validate incoming request body/params using standard validation rules before passing data to services.