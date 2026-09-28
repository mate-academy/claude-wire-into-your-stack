const express = require('express');
const store = require('../db/store');

const router = express.Router();

// GET /todos — list all todos.
router.get('/', (req, res) => {
  res.json(store.listTodos());
});

// GET /todos/:id — fetch one todo, or 404 if it doesn't exist.
router.get('/:id', (req, res) => {
  const todo = store.getTodo(Number(req.params.id));
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  return res.json(todo);
});

// POST /todos — create a todo. Requires title; done defaults to false.
router.post('/', (req, res) => {
  const { title, done } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }
  const todo = store.createTodo({ title, done: done === undefined ? false : done });
  return res.status(201).json(todo);
});

// PUT /todos/:id — update an existing todo's title and/or done state.
router.put('/:id', (req, res) => {
  const { title, done } = req.body;
  if (title === undefined && done === undefined) {
    return res.status(400).json({ error: 'title or done is required' });
  }
  const todo = store.updateTodo(Number(req.params.id), { title, done });
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  return res.json(todo);
});

module.exports = router;
