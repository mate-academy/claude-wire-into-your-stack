const express = require('express');
const store = require('../db/store');

const router = express.Router();

// GET /products — list all products.
router.get('/', (req, res) => {
  res.json(store.listProducts());
});

// GET /products/:id — fetch one product, or 404 if it doesn't exist.
router.get('/:id', (req, res) => {
  const product = store.getProduct(Number(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  return res.json(product);
});

// POST /products — create a product. Requires name and price (number).
router.post('/', (req, res) => {
  const { name, price } = req.body;
  if (!name || price === undefined || typeof price !== 'number') {
    return res.status(400).json({ error: 'name and price (number) are required' });
  }
  const product = store.createProduct({ name, price });
  return res.status(201).json(product);
});

module.exports = router;
