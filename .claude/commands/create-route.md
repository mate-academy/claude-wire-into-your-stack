# Create Route

## Description
Scaffold a new resource route following the project's patterns. Generates the route file, data store helpers, and updates server.js to mount it.

## Usage
```
/create-route <resource-name>
```

## Example
```
/create-route posts
```

This will:
1. Create `routes/posts.js` with CRUD endpoints
2. Add helpers to `db/store.js` (listPosts, getPost, createPost, updatePost)
3. Mount the router in `server.js` under `/posts`

## What It Generates

The scaffolded route includes:
- **GET /resource** — list all records
- **GET /resource/:id** — fetch one record (404 if missing)
- **POST /resource** — create a record (validates required fields)
- **PUT /resource/:id** — update a record (404 if missing)

Error handling:
- `400` for missing/invalid input
- `404` for missing records
- `201` for successful creation
- All errors return `{ "error": "message" }`

## Next Steps
1. Review the generated files
2. Update field validation in routes/<resource>.js as needed
3. Add test cases to tests/<resource>.test.js
4. Test with curl or Postman
