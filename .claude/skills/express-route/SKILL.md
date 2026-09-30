# Express Route Pattern

## Description
Triggered when the user asks to create a new Express route or endpoint. Used to ensure new routes follow the project's conventions: one route file per resource, validation in the route layer, proper error handling with `{ error: "message" }` format, mounting in server.js.

## Pattern
When asked to:
- Create a new route
- Add an endpoint
- Write a new resource handler
- Scaffold a route file

## Behavior
1. Ask which resource this is for (confirm the resource name)
2. Use the project's error-response format: `res.status(XXX).json({ error: "..." })`
3. Validate input in the route; return 400 on bad input, 404 when missing
4. Suggest mounting it in `server.js` under `/resourcename`
5. Provide a test template showing the new endpoint

## Example
User: "I need a route for products"
→ Proposes: `routes/products.js` following the same pattern as `routes/users.js`
→ Validates: `name` and `price` required on POST
→ Handles: 400 for missing fields, 404 for missing products
→ Tests: Create a test case in `tests/products.test.js`
