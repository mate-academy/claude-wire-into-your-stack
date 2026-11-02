const express = require('express');
const store = require('../db/store');

const router = express.Router();

// GET /books — list all books in the library.
router.get('/', (req, res) => {
  res.json(store.listBooks());
});

// GET /books/:id — fetch one book, or 404 if it doesn't exist.
router.get('/:id', (req, res) => {
  const book = store.getBook(Number(req.params.id));
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  return res.json(book);
});

// POST /books — add a book to the library. Requires title and author.
router.post('/', (req, res) => {
  const { title, author } = req.body;
  if (!title || !author) {
    return res.status(400).json({ error: 'title and author are required' });
  }
  const book = store.createBook({ title, author });
  return res.status(201).json(book);
});

module.exports = router;
