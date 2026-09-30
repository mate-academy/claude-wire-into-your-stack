# /review-route

Review a route file against the project's conventions and standards.

## Usage
```
/review-route $1
```

Where `$1` is the path to the route file (e.g., `routes/users.js`).

## What it checks
- Proper error response format: `{ error: "message" }`
- HTTP status codes: 400 for validation, 404 for missing resources, 201 for creation
- Input validation happens in the route, not elsewhere
- Router exported correctly as `module.exports = router`
- Endpoints follow RESTful conventions (GET, POST, PUT, DELETE where appropriate)
- All fields used in updates are validated (name/email/etc)

## Example
```
/review-route routes/users.js
```

Routes through the Express Route Pattern skill automatically.
