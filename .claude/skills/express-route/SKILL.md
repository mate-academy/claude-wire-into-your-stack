---
name: express-route-generator
description: Generate a new Express route or API endpoint following project conventions
trigger-keywords:
  - "create.*route"
  - "add.*endpoint"
  - "new.*api"
  - "express.*handler"
allowed-tools:
  - Write
  - Edit
  - Read
  - Glob
---

# Express Route Generator

This skill generates new Express routes and API endpoints for the Course API project, following established project conventions.

## Project Standards

### File Structure
- All routes live in `routes/` directory
- One resource = one file (e.g., `routes/users.js`, `routes/health.js`)
- Each route file **must export an Express router** as the default export

### Data Access
- **All data operations go through `db/store.js`** — never hold state directly in routes
- Import the store: `const store = require('../db/store');`
- Use store methods to read/write data

### Error Handling & Responses
- **Bad input** → return `400` with error object
- **Resource not found** → return `404` with error object
- **Error response format**: `{ "error": "descriptive message" }`
- **Success responses**: return the data object or array

### Handler Structure
- Use arrow functions or function declarations
- Validate request params, query, body **in the route**
- Return appropriate HTTP status codes
- Keep logic in the route; avoid middleware clutter

## Example Route

```javascript
const express = require('express');
const store = require('../db/store');

const router = express.Router();

// GET /resources
router.get('/', (req, res) => {
  const resources = store.getAll('resources');
  res.json(resources);
});

// GET /resources/:id
router.get('/:id', (req, res) => {
  const resource = store.get('resources', req.params.id);
  if (!resource) {
    return res.status(404).json({ error: 'Resource not found' });
  }
  res.json(resource);
});

// POST /resources
router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const resource = store.create('resources', { name });
  res.status(201).json(resource);
});

module.exports = router;
```

## Integration into server.js

After creating your route file, mount it in `server.js`:

```javascript
const myRoute = require('./routes/my-resource');
app.use('/my-resource', myRoute);
```

## Before You Start

1. **Existing routes** — check `routes/` to see naming patterns
2. **Store interface** — review `db/store.js` for available methods
3. **Test your route** — use `npm test` to verify it works
