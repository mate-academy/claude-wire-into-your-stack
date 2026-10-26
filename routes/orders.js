const express = require('express');
const store = require('../db/store');

const router = express.Router();

// GET /orders — list all orders.
router.get('/', (req, res) => {
  res.json(store.listOrders());
});

// GET /orders/:id — fetch one order, or 404 if it doesn't exist.
router.get('/:id', (req, res) => {
  const order = store.getOrder(Number(req.params.id));
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  return res.json(order);
});

// POST /orders — create an order. Requires product and quantity.
router.post('/', (req, res) => {
  const { product, quantity } = req.body;
  if (!product || quantity === undefined) {
    return res.status(400).json({ error: 'product and quantity are required' });
  }
  const order = store.createOrder({ product, quantity });
  return res.status(201).json(order);
});

// PUT /orders/:id — update an existing order.
router.put('/:id', (req, res) => {
  const { product, quantity } = req.body;
  if (product === undefined && quantity === undefined) {
    return res.status(400).json({ error: 'product or quantity is required' });
  }
  const order = store.updateOrder(Number(req.params.id), { product, quantity });
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  return res.json(order);
});

module.exports = router;
