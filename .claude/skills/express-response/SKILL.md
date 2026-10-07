When adding a new Express POST route handler that creates a resource.
Pattern:
router.post('/', (req, res) => {
  const { ... } = req.body;
  if (!requiredFields) {
    return res.status(400).json({ error: 'message' });
  }
  const result = doSomething(...);
  return res.status(201).json(result);
});
