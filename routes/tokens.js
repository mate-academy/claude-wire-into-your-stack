const express = require('express');
const store = require('../db/store');

const router = express.Router();

// POST /tokens — create a new bearer token.
// Body: { name } (optional label). Returns the full token object including
// the secret value — shown here on creation only.
router.post('/', (req, res) => {
  const { name } = req.body;
  const token = store.createToken({ name });
  return res.status(201).json(token);
});

// DELETE /tokens/:id — revoke a token by id.
// Returns 204 whether or not the token existed (idempotent).
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  store.revokeToken(id);
  return res.status(204).send();
});

module.exports = router;
