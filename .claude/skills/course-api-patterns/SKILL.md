---
name: course-api-patterns
description: >-
  When writing, modifying, or reviewing route handlers (routes/*.js), test
  files (tests/*.test.js), or error-response conventions for the Course API
  Express project — using express.Router() with db/store.js for all data
  access, node:test with supertest for testing, and errors returned as JSON
  { "error": "message" }
when_to_use: >-
  Trigger when asked to add endpoints, create routes, write tests, handle
  errors, or follow the project's coding conventions. Examples: "add a
  products route", "write tests for the health endpoint", "return 404 when a
  user doesn't exist", "create a new resource with full CRUD".
---

# Course API — Project Coding Conventions

This skill encodes the established conventions of the **Course API** Express.js
project. Apply these rules whenever writing or modifying routes, tests, or
error-handling code.

## Server (`server.js`)

- Use `require('express')` (CommonJS, not ES modules).
- Register `app.use(express.json())` for body parsing.
- Mount each resource router: `app.use('/<resource>', router)`.
- Export the app: `module.exports = app;` so tests can import it.
- Guard the server start: `if (require.main === module) { app.listen(...) }`.

## Route Handlers (`routes/<resource>.js`)

- `const router = express.Router();`
- All data access through `db/store.js` — routes hold no state.
- Convert IDs: `Number(req.params.id)`.
- **Validate input** from `req.body`; return `400` with `{ error: 'message' }`.
- **Not found**: return `404` with `{ error: 'Item not found' }`.
- **Created**: return `201` for POST.
- **Success**: `200` for GET/PUT.
- Use early `return res.status(...).json(...)`.
- End with `module.exports = router;`.

## Error Response Format

Always `{ "error": "descriptive message" }` — key is `error` (lowercase, singular).

## Tests (`tests/<resource>.test.js`)

- `require('node:test')` and `require('node:assert')` — Node built-ins.
- `require('supertest')` for HTTP requests.
- Import app: `const app = require('../server');`
- Import store: `const store = require('../db/store');`
- `test.beforeEach(() => store.reset());` for clean state.
- `test('description', async () => { ... });` format.
- `request(app).get('/path')`, `.post(...)`, `.put(...)`.
- Assert: `assert.equal(res.status, N)`, `assert.equal(res.body.field, value)`.

## Store (`db/store.js`)

- In-memory data with `seed()` and `reset()` for tests.
- Export CRUD functions: `listItems()`, `getItem(id)`, `createItem({...})`, `updateItem(id, fields)`.
