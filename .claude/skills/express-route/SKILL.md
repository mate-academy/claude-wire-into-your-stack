# Express Route Pattern

When asked to add a new route, endpoint, or handler to this Express API, follow this pattern:

1. **Create a new router file** in `routes/` or edit an existing one
2. **Import Express and the data store**:
   ```js
   const express = require('express');
   const store = require('../db/store');
   const router = express.Router();
   ```
3. **Add a comment above each handler** describing the endpoint, method, and purpose:
   ```js
   // GET /resource/:id — fetch one resource, or 404 if it doesn't exist.
   ```
4. **Validate input first**, return `400` with error message if validation fails:
   ```js
   if (!name || !email) {
     return res.status(400).json({ error: 'name and email are required' });
   }
   ```
5. **Access data only through `db/store.js`** methods, never direct state manipulation
6. **Return 404 with error message** if a resource is not found:
   ```js
   if (!user) {
     return res.status(404).json({ error: 'User not found' });
   }
   ```
7. **Return 201 for POST (create)**, 200 for GET/PUT/DELETE**, success response is JSON:
   ```js
   return res.status(201).json(user);
   ```
8. **Export the router** at the end:
   ```js
   module.exports = router;
   ```
9. **Mount it in `server.js`** under its base path if it's a new resource

Error response format is always: `{ "error": "message" }`
