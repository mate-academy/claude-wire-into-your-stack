---
name: express-route
description: How to write Express routes in this Course API. Use whenever someone asks to add, create, or scaffold a new route, endpoint, or resource (e.g. "add a /products route", "create a POST endpoint for orders", "add DELETE /users/:id"), or to add a handler to an existing router in routes/. Covers 400 validation, 404 for missing records, JSON { "error": "..." } errors, going through db/store.js, and mounting the router in server.js.
---

# Writing an Express route in this project

Follow the existing pattern in `routes/users.js`. A new route must satisfy every rule below.

## Rules

1. **One file per resource** in `routes/<resource>.js`. Create the router with `express.Router()` and end the file with `module.exports = router;`.
2. **Mount it in `server.js`**: `require` it next to the other routers and add `app.use('/<resource>', <resource>Router);` next to the existing `app.use` calls (after `express.json()`). Paths inside the router are relative to the mount path (`/`, `/:id`).
3. **No state in the route.** Read and write only through helpers in `db/store.js`. If a helper is missing, add it there (and export it). Also extend `seed()` so `reset()` restores the new data.
4. **Validate input in the route → `400`.** Check required body fields (and parse params like `Number(req.params.id)`) before you call the store. Return early: `return res.status(400).json({ error: 'name and email are required' });`
5. **Missing record → `404`.** If the store returns `undefined`, `return res.status(404).json({ error: '<Thing> not found' });`
6. **Every error is JSON shaped `{ "error": "message" }`.** Never use `res.send('...')` or `res.sendStatus()` for errors, and never use any other error shape.
7. **Success codes:** `200` via `res.json(...)` for reads and updates, `201` for creates.
8. Put a one-line comment above each handler in the house style: `// METHOD /path — what it does.`

## Template

```js
const express = require('express');
const store = require('../db/store');

const router = express.Router();

// GET /widgets/:id — fetch one widget, or 404 if it doesn't exist.
router.get('/:id', (req, res) => {
  const widget = store.getWidget(Number(req.params.id));
  if (!widget) {
    return res.status(404).json({ error: 'Widget not found' });
  }
  return res.json(widget);
});

// POST /widgets — create a widget. Requires name.
router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  const widget = store.createWidget({ name });
  return res.status(201).json(widget);
});

module.exports = router;
```

In `server.js`:

```js
const widgetsRouter = require('./routes/widgets');
// ...
app.use('/widgets', widgetsRouter);
```

## Tests

Add cases to `tests/<resource>.test.js` (Node's built-in `node:test` + `supertest`, with `test.beforeEach(() => store.reset())`). Cover the happy path, the `400` case, and the `404` case. Then run `npm test` and `npm run lint`.
