const express = require('express');

const router = express.Router();

/**
 * GET /products — placeholder endpoint for the products resource.
 */
router.get('/', (req, res) => {
  res.json({ message: 'products route' });
});

module.exports = router;
