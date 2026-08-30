const express = require('express');
const store = require('../db/store');

const router = express.Router();

// GET /posts — list all posts.
router.get('/', (req, res) => {
  res.json(store.listPosts());
});

// GET /posts/:id — fetch one post, or 404 if it doesn't exist.
router.get('/:id', (req, res) => {
  const post = store.getPost(Number(req.params.id));
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  return res.json(post);
});

// POST /posts — create a post. Requires title and body.
router.post('/', (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) {
    return res.status(400).json({ error: 'title and body are required' });
  }
  const post = store.createPost({ title, body });
  return res.status(201).json(post);
});

// PUT /posts/:id — update an existing post.
router.put('/:id', (req, res) => {
  const { title, body } = req.body;
  if (title === undefined && body === undefined) {
    return res.status(400).json({ error: 'title or body is required' });
  }
  const post = store.updatePost(Number(req.params.id), { title, body });
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  return res.json(post);
});

module.exports = router;
