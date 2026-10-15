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

## Tasks

A task looks like:
```json
{ "id": 1, "user_id": 1, "description": "Write the analytical engine paper" }
```

### GET /tasks
Returns an array of all tasks.

### GET /tasks/:id
Returns a single task, or `404` if no task has that id.

### POST /tasks
Creates a task. Body requires `user_id` and `description`; returns `201` with the created task, or `400` if either field is missing.

### PUT /tasks/:id
Updates an existing task. Body may include `user_id`, `description`, or both. Returns the updated task, `400` if neither field is given, or `404` if the task does not exist.

## Roles

A role looks like:
```json
{ "id": 1, "title": "Admin", "description": "Full access to all resources" }
```

### GET /roles
Returns an array of all roles.

### GET /roles/:id
Returns a single role, or `404` if no role has that id.

### POST /roles
Creates a role. Body requires `title` and `description`; returns `201` with the created role, or `400` if either field is missing.

### PUT /roles/:id
Updates an existing role. Body may include `title`, `description`, or both. Returns the updated role, `400` if neither field is given, or `404` if the role does not exist.
