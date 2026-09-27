const express = require('express');

const router = express.Router();

// GET /health — a simple liveness check.
router.get('/', (req, res) => {
  const uptime = process.uptime();
  res.json({ status: 'ok', uptime });
});

module.exports = router;
