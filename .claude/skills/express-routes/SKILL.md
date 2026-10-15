---
name: Express Route Skill
description: "When creating a new route endpoint"
---
# PR description
When adding a new route to this Express API:
1. Create a new file in the `routes/` folder
2. Use the standard pattern:
   - `const express = require('express'); const router = express.Router();`
   - Define routes with `router.METHOD('/path', handler)`
   - Return JSON with `res.json({ ... })`
   - Export with `module.exports = router;`


3. Mount the route in `server.js` with `app.use('/path', require('./routes/name'))`


4. Include a JSDoc comment describing the endpoint
