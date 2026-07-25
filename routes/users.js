const express = require('express');
const store = require('../db/store');
const { logError } = require('../utils/logger');

const router = express.Router();

function parseId(req) {
  try {
    return Number(req.params.id);
  } catch (err) {
    logError('parseId', err);
    throw err;
  }
}

function sendNotFound(res) {
  try {
    return res.status(404).json({ error: 'User not found' });
  } catch (err) {
    logError('sendNotFound', err);
    throw err;
  }
}

// GET /users — list all users.
router.get('/', (req, res) => {
  try {
    res.json(store.listUsers());
  } catch (err) {
    logError('GET /users', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /users/:id — fetch one user, or 404 if it doesn't exist.
router.get('/:id', (req, res) => {
  try {
    const user = store.getUser(parseId(req));
    if (!user) {
      return sendNotFound(res);
    }
    return res.json(user);
  } catch (err) {
    logError('GET /users/:id', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /users — create a user. Requires name and email.
router.post('/', (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'name and email are required' });
    }
    const user = store.createUser({ name, email });
    return res.status(201).json(user);
  } catch (err) {
    logError('POST /users', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /users/:id — update an existing user (added in Project 2).
router.put('/:id', (req, res) => {
  try {
    const { name, email } = req.body;
    if (name === undefined && email === undefined) {
      return res.status(400).json({ error: 'name or email is required' });
    }
    const user = store.updateUser(parseId(req), { name, email });
    if (!user) {
      return sendNotFound(res);
    }
    return res.json(user);
  } catch (err) {
    logError('PUT /users/:id', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
