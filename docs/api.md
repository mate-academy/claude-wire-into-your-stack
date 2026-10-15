# API reference

Base URL: `http://localhost:3000`

All request and response bodies are JSON. Errors come back as `{ "error": "message" }`.

## Health

### GET /health
Returns the service status.

Response `200`:
```json
{ "status": "ok", "uptime": 12.34 }
```

## Users

A user looks like:
```json
{ "id": 1, "name": "Ada Lovelace", "email": "ada@example.com" }
```

### GET /users
Returns an array of all users.

### GET /users/:id
Returns a single user, or `404` if no user has that id.

### POST /users
Creates a user. Body requires `name` and `email`; returns `201` with the created user, or `400` if either field is missing.

### PUT /users/:id
Updates an existing user. Body may include `name`, `email`, or both. Returns the updated user, `400` if neither field is given, or `404` if the user does not exist.

## Products

A product looks like:
```json
{ "id": 1, "name": "Widget", "price": 9.99 }
```

### GET /products
Returns an array of all products.

### GET /products/:id
Returns a single product, or `404` if no product has that id.

### POST /products
Creates a product. Body requires `name` and `price`; returns `201` with the created product, or `400` if either field is missing.

### PUT /products/:id
Updates an existing product. Body may include `name`, `price`, or both. Returns the updated product, `400` if neither field is given, or `404` if the product does not exist.
