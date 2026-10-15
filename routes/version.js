const express = require('express');
const { version } = require('../package.json');

const router = express.Router();

// GET /api/version — returns the API's package version.
router.get('/', (req, res) => {
  res.json({ version });
});

module.exports = router;
