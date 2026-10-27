---
name: scaffold-route
description: Scaffold a new resource route with store helpers and tests
---

# Scaffold a New Route

This command scaffolds a complete new resource following the Course API conventions.

## Usage

```
/scaffold-route <resource-name> <fields...>
```

Example:
```
/scaffold-route posts title content authorId
/scaffold-route products name price sku
```

## What It Creates

1. **`routes/<resource>.js`** — Express router with GET/POST/PUT handlers
2. **Store helpers in `db/store.js`** — list, get, create, update, reset functions
3. **`tests/<resource>.test.js`** — Test suite with beforeEach reset
4. **Mounts router in `server.js`** — adds `app.use('/<resource>', resourceRouter)`

## Conventions Followed

- One route file per resource in `routes/`
- All data access through `db/store.js`
- Validation in route: 400 for bad input, 404 for missing
- Error responses: `{ "error": "message" }`
- Tests use `test.beforeEach(() => store.reset())`
- 201 for creation, 200 for updates

## After Scaffolding

Run `npm test` to verify the new route works.