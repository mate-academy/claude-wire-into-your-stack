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
Returns `200` with an array of all users.

### GET /users/:id
Returns `200` with a single user, or `404` if no user has that id.

### POST /users
Creates a user. Body requires `name` and `email`; returns `201` with the created
user, or `400` if either field is missing. The created user's `id` identifies its
resource at `/users/:id` (no `Location` header is sent).

### PUT /users/:id
Updates an existing user. Body may include `name`, `email`, or both. Returns `200`
with the updated user, `400` if neither field is given, or `404` if the user does
not exist.

## Method semantics

Per [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110): `GET` is safe, and `GET`
and `PUT` are idempotent — repeating the same `PUT /users/:id` body leaves the
user in the same final state. This API's `PUT` only replaces fields on an
existing user; it never creates one, so an unknown id is `404` rather than an
upsert. `POST /users` is neither safe nor idempotent: each call creates another
user.
