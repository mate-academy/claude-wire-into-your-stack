const express = require('express');

const router = express.Router();

// GET /api/ping — liveness check.
router.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = router;
