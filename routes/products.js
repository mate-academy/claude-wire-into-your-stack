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

// POST /products — create a product. Requires name and price.
router.post('/', (req, res) => {
  const { name, price } = req.body;
  if (name === undefined || price === undefined) {
    return res.status(400).json({ error: 'name and price are required' });
  }
  const product = store.createProduct({ name, price });
  return res.status(201).json(product);
});

// PUT /products/:id — update an existing product.
router.put('/:id', (req, res) => {
  const { name, price } = req.body;
  if (name === undefined && price === undefined) {
    return res.status(400).json({ error: 'name or price is required' });
  }
  const product = store.updateProduct(Number(req.params.id), { name, price });
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  return res.json(product);
});

module.exports = router;
