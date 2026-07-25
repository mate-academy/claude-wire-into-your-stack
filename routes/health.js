const express = require('express');
const { logError } = require('../utils/logger');

const router = express.Router();

// GET /health — a simple liveness check.
router.get('/', (req, res) => {
  try {
    res.json({ status: 'ok', uptime: process.uptime() });
  } catch (err) {
    logError('GET /health', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
