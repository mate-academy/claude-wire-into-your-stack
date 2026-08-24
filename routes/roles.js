const express = require('express');
const store = require('../db/store');

const router = express.Router();

// GET /roles — list all roles.
router.get('/', (req, res) => {
  res.json(store.listRoles());
});

// GET /roles/:id — fetch one role, or 404 if it doesn't exist.
router.get('/:id', (req, res) => {
  const role = store.getRole(Number(req.params.id));
  if (!role) {
    return res.status(404).json({ error: 'Role not found' });
  }
  return res.json(role);
});

// POST /roles — create a role. Requires title and description.
router.post('/', (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'title and description are required' });
  }
  const role = store.createRole({ title, description });
  return res.status(201).json(role);
});

// PUT /roles/:id — update an existing role.
router.put('/:id', (req, res) => {
  const { title, description } = req.body;
  if (title === undefined && description === undefined) {
    return res.status(400).json({ error: 'title or description is required' });
  }
  const role = store.updateRole(Number(req.params.id), { title, description });
  if (!role) {
    return res.status(404).json({ error: 'Role not found' });
  }
  return res.json(role);
});

module.exports = router;
