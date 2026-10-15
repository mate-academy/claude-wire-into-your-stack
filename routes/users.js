const express = require('express');
const store = require('../db/store');

const router = express.Router();

// GET /users — list all users.
router.get('/', (req, res) => {
  res.json(store.listUsers());
});

// GET /users/:id — fetch one user, or 404 if it doesn't exist.
router.get('/:id', (req, res) => {
  const user = store.getUser(Number(req.params.id));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json(user);
});

// POST /users — create a user. Requires name and email.
router.post('/', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }
  const user = store.createUser({ name, email });
  return res.status(201).json(user);
});

// POST /users/bulk — create multiple users from a JSON array. Requires a
// non-empty `users` array; every item must have name and email, or the
// whole batch is rejected.
router.post('/bulk', (req, res) => {
  const { users } = req.body;
  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).json({ error: 'users must be a non-empty array' });
  }
  const invalid = users.some((user) => !user || !user.name || !user.email);
  if (invalid) {
    return res.status(400).json({ error: 'each user requires name and email' });
  }
  const created = store.createUsers(users);
  return res.status(201).json(created);
});

// PUT /users/:id — update an existing user (added in Project 2).
router.put('/:id', (req, res) => {
  const { name, email } = req.body;
  if (name === undefined && email === undefined) {
    return res.status(400).json({ error: 'name or email is required' });
  }
  const user = store.updateUser(Number(req.params.id), { name, email });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json(user);
});

// DELETE /users/:id — delete an existing user.
router.delete('/:id', (req, res) => {
  const deleted = store.deleteUser(Number(req.params.id));
  if (!deleted) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.status(204).send();
});

module.exports = router;
