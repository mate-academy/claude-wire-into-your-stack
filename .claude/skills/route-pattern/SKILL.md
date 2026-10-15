---
name: route-pattern
description: Écrire une nouvelle route Express suivant les conventions du projet
---

# Writing a Route in This Project

When writing a route handler for this Express API, follow these patterns:

## Structure
1. Extract input from `req.body` or `req.params`
2. Validate required fields → return `res.status(400).json({ error: "message" })` if invalid
3. Call the appropriate `store.method()`
4. Check if the operation succeeded (e.g., check for `null` on not found)
5. Return the result with the correct HTTP status:
   - `200` for successful reads or updates
   - `201` for successful creates
   - `400` for validation errors
   - `404` for resources not found

## Error Format
Always use `{ "error": "message" }` for error responses.

## Key Points
- Always validate before calling store
- Always check for missing resources and return 404
- Use early return to avoid nested if statements
- Keep error messages consistent with existing routes
