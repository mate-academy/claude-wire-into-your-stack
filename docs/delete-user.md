# Deleting a user

## Via the API

### DELETE /users/:id

Deletes the user with the given id.

Response `204` on success (no body).

If no user has that id, returns `404`:
```json
{ "error": "User not found" }
```

### Example

```bash
curl -X DELETE http://localhost:3000/users/3
```

## In code

`routes/users.js` would handle the request and call a `store.deleteUser`
function in `db/store.js`, which removes the matching user from the
in-memory list and returns whether a user was actually removed, so the
route knows whether to respond with `204` or `404`.

Note: this endpoint is not implemented yet — this document describes the
intended behavior, following the same conventions as the existing
`GET`, `POST`, and `PUT` routes on `/users`.
