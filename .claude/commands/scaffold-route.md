# Scaffold a new Express route
Create a new route file in the `routes/` folder and mount it in `server.js`.
## Input
- $ARGUMENTS: The route name (e.g., "users" or "products")


## Steps
1. Create `routes/<name>.js` with:
   - `const express = require('express'); const router = express.Router();`
   - A basic GET `/` endpoint returning `{ message: '<name> route' }`
   - JSDoc comment describing the route
   - `module.exports = router;`


2. Mount in `server.js` with:
   ```javascript
   app.use('/<name>', require('./routes/<name>'));
   ```
