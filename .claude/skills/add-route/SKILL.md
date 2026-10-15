# Add a new route

This skill triggers when the user asks to:
- "Add a new route" or "add a route handler"
- "Create a new endpoint" or "add a new endpoint"
- "Add an API endpoint" or "create an API route"
- "Build a new route for [resource]" or "add handlers for [resource]"
- "Implement a new REST endpoint" or "create a CRUD route"
- Any request to add, create, or implement a new HTTP route/endpoint in the Express app

When triggered, create a new resource route following the project's established pattern.

## Route structure

Each route file goes in `routes/` and exports an Express Router. Follow these conventions:

1. **Data access**: All reads and writes go through `db/store.js` — routes never hold state directly.
2. **Validation**: Validate input in the route. Return `400` with `{ "error": "message" }` on bad input.
3. **Not found**: Return `404` with `{ "error": "message" }` when a record is missing.
4. **Success responses**: Return the resource as JSON. Use `201` for POST, `200` for GET/PUT/DELETE.
5. **Router export**: Always `module.exports = router;` at the end.
6. **Mount in server.js**: Add `app.use('/<resource>', <resourceRouter>);` after the other route mounts.

## Example template

```javascript
const express = require('express');
const store = require('../db/store');

const router = express.Router();

// GET /<resource> — list all resources.
router.get('/', (req, res) => {
  res.json(store.list<Resource>s());
});

// GET /<resource>/:id — fetch one resource, or 404 if missing.
router.get('/:id', (req, res) => {
  const resource = store.get<Resource>(Number(req.params.id));
  if (!resource) {
    return res.status(404).json({ error: '<Resource> not found' });
  }
  return res.json(resource);
});

// POST /<resource> — create a resource. Requires name and email.
router.post('/', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }
  const resource = store.create<Resource>({ name, email });
  return res.status(201).json(resource);
});

module.exports = router;
```

After creating the route, add the corresponding store methods in `db/store.js` if they don't exist.
