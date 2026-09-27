# Error Response Format Convention

**Trigger:** When handling errors, returning error responses, reviewing error handling, working with error formats, or checking API error behavior.

## How Errors Are Formatted

All error responses return JSON with a consistent shape and appropriate HTTP status codes.

### Error Response Pattern
```javascript
res.status(400).json({ error: 'error message' });
res.status(404).json({ error: 'resource not found' });
```

### Standard Status Codes and Messages
- **400 Bad Request** — when required input is missing or invalid
  - Example: `{ "error": "name and email are required" }`
  - Example: `{ "error": "name or email is required" }`
  - Use this when validation fails on request body

- **404 Not Found** — when a record doesn't exist
  - Example: `{ "error": "User not found" }`
  - Use this when querying for a resource by ID that doesn't exist

- **201 Created** — for successful POST requests
  - Returns the created resource in the response body (not an error, but important status code)
  - Example: `res.status(201).json(user)`

- **200 OK** — default for successful GET, PUT, DELETE
  - Returns the resource or data in the response body

### Implementation Pattern
```javascript
// Validation error (400)
if (!name || !email) {
  return res.status(400).json({ error: 'name and email are required' });
}

// Not found error (404)
const user = store.getUser(id);
if (!user) {
  return res.status(404).json({ error: 'User not found' });
}

// Success response
return res.json(user);
```

## Key Convention
- **Error shape:** Always `{ "error": "message" }` — never change this structure
- **No error codes/types:** Only include the human-readable message string
- **Early return:** Use `return res.status(...).json(...)` to exit the route handler early

## Apply This When
- Adding error handling to routes
- Reviewing error responses in routes
- Writing tests that verify error behavior
- Debugging why an error response isn't being returned correctly
