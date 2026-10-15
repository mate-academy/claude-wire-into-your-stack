const express = require('express');
const store = require('../db/store');

const router = express.Router();

// GET /tasks — list all tasks.
router.get('/', (req, res) => {
  res.json(store.listTasks());
});

// GET /tasks/:id — fetch one task, or 404 if it doesn't exist.
router.get('/:id', (req, res) => {
  const task = store.getTask(Number(req.params.id));
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  return res.json(task);
});

// POST /tasks — create a task. Requires user_id and description.
router.post('/', (req, res) => {
  const { user_id, description } = req.body;
  if (!user_id || !description) {
    return res.status(400).json({ error: 'user_id and description are required' });
  }
  const task = store.createTask({ user_id, description });
  return res.status(201).json(task);
});

// PUT /tasks/:id — update an existing task.
router.put('/:id', (req, res) => {
  const { user_id, description } = req.body;
  if (user_id === undefined && description === undefined) {
    return res.status(400).json({ error: 'user_id or description is required' });
  }
  const task = store.updateTask(Number(req.params.id), { user_id, description });
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  return res.json(task);
});

module.exports = router;
