const express = require('express');
const store = require('../db/store');
const parseId = require('../lib/parseId');
const requireToken = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

// POST /tokens — create a new bearer token (open; bootstrapping).
// Always creates a client token — role from the request body is ignored.
router.post('/', (req, res) => {
  const { name } = req.body ?? {};
  const token = store.createToken({ name, role: 'client' });
  return res.status(201).json(token);
});

// DELETE /tokens/:id — revoke a token by id. Admin only.
// Returns 204 whether or not the token existed (idempotent).
router.delete('/:id', requireToken, requireAdmin, (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  store.revokeToken(id);
  return res.status(204).send();
});

module.exports = router;
