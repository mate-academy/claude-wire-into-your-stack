# /review-routes

Review all routes in this Express API against the project's patterns and conventions.

---

Check that all routes in `routes/` follow these standards:
- Each route has a descriptive comment above it
- Input validation returns 400 with `{ error: "..." }`
- Missing resources return 404 with `{ error: "..." }`
- POST returns 201, GET/PUT/DELETE return 200
- All data access goes through `db/store.js`, never direct state
- Error response format is always `{ error: "message" }`

List any violations, suggest fixes, and confirm the routes are ready.
