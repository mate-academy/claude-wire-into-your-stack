const express = require('express');
const store = require('../db/store');

const router = express.Router();

// GET /categories — list all categories.
router.get('/', (req, res) => {
  res.json(store.listCategories());
});

// GET /categories/:id — fetch one category, or 404 if it doesn't exist.
router.get('/:id', (req, res) => {
  const category = store.getCategory(Number(req.params.id));
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }
  return res.json(category);
});

// POST /categories — create a category. Requires name and description.
router.post('/', (req, res) => {
  const { name, description } = req.body;
  if (!name || !description) {
    return res.status(400).json({ error: 'name and description are required' });
  }
  const category = store.createCategory({ name, description });
  return res.status(201).json(category);
});

// PUT /categories/:id — update an existing category.
router.put('/:id', (req, res) => {
  const { name, description } = req.body;
  if (name === undefined && description === undefined) {
    return res.status(400).json({ error: 'name or description is required' });
  }
  const category = store.updateCategory(Number(req.params.id), { name, description });
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }
  return res.json(category);
});

module.exports = router;
