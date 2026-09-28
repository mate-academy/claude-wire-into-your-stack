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

## Todos

A todo looks like:
```json
{ "id": 1, "title": "Write the docs", "done": false }
```

### GET /todos
Returns an array of all todos.

### GET /todos/:id
Returns a single todo, or `404` if no todo has that id.

### POST /todos
Creates a todo. Body requires `title`; `done` is optional and defaults to `false`. Returns `201` with the created todo, or `400` if `title` is missing.

### PUT /todos/:id
Updates an existing todo. Body may include `title`, `done`, or both. Returns the updated todo, `400` if neither field is given, or `404` if the todo does not exist.
