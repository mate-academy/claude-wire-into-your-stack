const express = require('express');

const router = express.Router();

// Health check endpoint used to verify the API is running and report uptime
router.get('/', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

module.exports = router;
