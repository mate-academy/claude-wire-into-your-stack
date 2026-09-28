# Creating a user

## Via the API

### POST /users

Body requires `name` and `email`:
```json
{ "name": "Grace Hopper", "email": "grace@example.com" }
```

Response `201` with the created user:
```json
{ "id": 3, "name": "Grace Hopper", "email": "grace@example.com" }
```

If `name` or `email` is missing, returns `400`:
```json
{ "error": "name and email are required" }
```

### Example

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Grace Hopper", "email": "grace@example.com"}'
```

## In code

`routes/users.js` handles the request and calls `store.createUser` in
`db/store.js`, which assigns the next `id` and appends the user to the
in-memory list.
