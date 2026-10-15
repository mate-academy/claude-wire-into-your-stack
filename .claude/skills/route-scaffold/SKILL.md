# Route Scaffolding Skill

## Trigger
Use this skill when asked to: create a new route, add a new endpoint, scaffold a new resource handler, or generate a new router file.

## Pattern

This project follows a strict routing pattern. Every new route must:

1. **Create a new file** in `routes/<resource>.js`
2. **Export an Express Router** with all CRUD operations for that resource
3. **Validate input** in the route handler (return 400 on bad input)
4. **Handle missing records** (return 404 when appropriate)
5. **Use the data store** — all routes access data via `db/store.js`
6. **Return consistent error format** — `{ "error": "message" }`
7. **Mount in server.js** under the resource's base path

## Data Store Contract

The `db/store.js` provides these helpers for every resource:
- `listResource()` — return all records
- `getResource(id)` — return one record or undefined
- `createResource({...fields})` — create and return record with id
- `updateResource(id, {...fields})` — update record or return undefined
- `reset()` — clear all data (for tests)

## Example: Creating a Comments Route

**File: `routes/comments.js`**

```javascript
const express = require('express');
const store = require('../db/store');

const router = express.Router();

// GET /comments — list all comments
router.get('/', (req, res) => {
  res.json(store.listComments());
});

// GET /comments/:id — fetch one comment, or 404 if it doesn't exist
router.get('/:id', (req, res) => {
  const comment = store.getComment(Number(req.params.id));
  if (!comment) {
    return res.status(404).json({ error: 'Comment not found' });
  }
  return res.json(comment);
});

// POST /comments — create a comment. Requires post_id and text.
router.post('/', (req, res) => {
  const { post_id, text } = req.body;
  if (!post_id || !text) {
    return res.status(400).json({ error: 'post_id and text are required' });
  }
  const comment = store.createComment({ post_id, text });
  return res.status(201).json(comment);
});

// PUT /comments/:id — update an existing comment.
router.put('/:id', (req, res) => {
  const { text } = req.body;
  if (text === undefined) {
    return res.status(400).json({ error: 'text is required' });
  }
  const comment = store.updateComment(Number(req.params.id), { text });
  if (!comment) {
    return res.status(404).json({ error: 'Comment not found' });
  }
  return res.json(comment);
});

module.exports = router;
```

**File: `server.js` — add mount:**
```javascript
const commentsRouter = require('./routes/comments');
app.use('/comments', commentsRouter);
```

**File: `db/store.js` — add helpers:**
```javascript
let comments = [];
let nextCommentId = 1;

function listComments() {
  return comments;
}

function getComment(id) {
  return comments.find((c) => c.id === id);
}

function createComment({ post_id, text }) {
  const comment = { id: nextCommentId, post_id, text };
  nextCommentId += 1;
  comments.push(comment);
  return comment;
}

function updateComment(id, fields) {
  const comment = getComment(id);
  if (!comment) return undefined;
  if (fields.text !== undefined) comment.text = fields.text;
  return comment;
}

module.exports = { listComments, getComment, createComment, updateComment, reset };
```

## Key Rules

- **One route file per resource** — never combine `/users` and `/comments` in one file
- **Always validate before operating** — check required fields in POST/PUT, return 400 if missing
- **Status codes matter** — 201 for created, 404 for missing, 400 for bad input
- **No state in routes** — all data flows through `db/store.js`
- **Test each new route** — add a test file in `tests/<resource>.test.js`

## When NOT to Use This Skill

- Modifying an existing route (use inline edits instead)
- Creating non-resource endpoints (like `/health`) — those don't follow this pattern
- Adding middleware or utilities — those go in their own files

## Testing the Route

After scaffolding, test with:
```bash
# List all
curl http://localhost:3000/comments

# Get one
curl http://localhost:3000/comments/1

# Create
curl -X POST http://localhost:3000/comments \
  -H "Content-Type: application/json" \
  -d '{"post_id": 1, "text": "Great post!"}'

# Update
curl -X PUT http://localhost:3000/comments/1 \
  -H "Content-Type: application/json" \
  -d '{"text": "Updated comment"}'
```
