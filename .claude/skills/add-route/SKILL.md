---
description: Fires when adding a new route, resource, or endpoint to this Express API. Covers how to create the router file, add store helpers, mount the router, and structure validation and error responses to match the project's conventions.
---

# Adding a route to this API

## File to create
`routes/<resource>.js` — one file per resource, named after it (e.g. `routes/notes.js`).

## Router pattern
```js
const express = require('express');
const store = require('../db/store');

const router = express.Router();

// GET /<resource> — list all.
router.get('/', (req, res) => {
  res.json(store.list<Resource>s());
});

// GET /<resource>/:id — fetch one, or 404.
router.get('/:id', (req, res) => {
  const item = store.get<Resource>(Number(req.params.id));
  if (!item) return res.status(404).json({ error: '<Resource> not found' });
  return res.json(item);
});

// POST /<resource> — create. Validate required fields → 400 or 201.
router.post('/', (req, res) => {
  const { field1, field2 } = req.body;
  if (!field1 || !field2) {
    return res.status(400).json({ error: 'field1 and field2 are required' });
  }
  return res.status(201).json(store.create<Resource>({ field1, field2 }));
});

module.exports = router;
```

## Store helpers to add in `db/store.js`
Add `list<Resource>s`, `get<Resource>`, `create<Resource>` following the same pattern as the existing user helpers.

## Mount in `server.js`
```js
const <resource>Router = require('./routes/<resource>');
app.use('/<resource>s', <resource>Router);
```

## Rules
- All data access goes through `db/store.js` — never hold state in the route file.
- Validate input in the route; return `400` with `{ "error": "..." }` on bad input.
- Return `404` with `{ "error": "..." }` when a record is missing.
- Each handler gets a one-line comment describing what it does.
- Error JSON shape is always `{ "error": "message" }` — no other shapes.
