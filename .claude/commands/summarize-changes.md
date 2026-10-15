# Summarize Changes

Summarize what changed in the repo. Optionally scaffold a new route if a route name is provided.

<!-- command -->

## Current State

Show git status and recent changes:

```
Current branch: $(git rev-parse --abbrev-ref HEAD)
Latest commits:
$(git log --oneline -5)

Staged changes:
$(git diff --cached --stat)

Unstaged changes:
$(git diff --stat)
```

## What Changed

List all file modifications:
```
$(git diff --name-status)
```

## Summary

Analyze the changes and summarize:
1. **What files changed** — categorize by type (routes, tests, config, etc.)
2. **Why they changed** — infer intent from file names and recent commits
3. **What's ready** — what's staged for commit vs. still in progress

If the user provided a route name in $ARGUMENTS:
Also scaffold a new route file called `routes/$ARGUMENTS.js` with:
- Express router setup
- Example GET /route endpoint
- Error handling pattern from the project
- Ready-to-customize structure

Example if $ARGUMENTS is "products":
```javascript
const express = require('express');
const store = require('../db/store');

const router = express.Router();

// GET /products — list all products.
router.get('/', (req, res) => {
  res.json(store.listProducts());
});

// GET /products/:id — fetch one product, or 404 if it doesn't exist.
router.get('/:id', (req, res) => {
  const product = store.getProduct(Number(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  return res.json(product);
});

// POST /products — create a product.
router.post('/', (req, res) => {
  // TODO: Add validation and store.createProduct() call
  return res.status(201).json({ /* product */ });
});

module.exports = router;
```

Then remind the user to:
1. Mount the new route in `server.js`
2. Add store methods (`listProducts`, `getProduct`, `createProduct`, etc.) to `db/store.js`
3. Add tests in `tests/products.test.js`
