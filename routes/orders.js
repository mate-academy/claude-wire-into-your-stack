const express = require('express');

const router = express.Router();

/**
 * GET /orders — placeholder endpoint for the orders resource.
 */
router.get('/', (req, res) => {
  res.json({ message: 'orders route' });
});

module.exports = router;
