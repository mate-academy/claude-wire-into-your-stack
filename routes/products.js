const express = require('express');
const store = require('../db/store');

const router = express.Router();

// POST /products — create a product. Requires name and a non-negative numeric price.
router.post('/', (req, res) => {
  const { name, price } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'name is required' });
  }
  if (typeof price !== 'number' || !Number.isFinite(price) || price < 0) {
    return res.status(400).json({ error: 'price must be a non-negative number' });
  }
  const product = store.createProduct({ name, price });
  return res.status(201).json(product);
});

module.exports = router;
