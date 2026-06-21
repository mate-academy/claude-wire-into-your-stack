const store = require('../db/store');

// Express middleware that enforces bearer-token authentication.
// Reads the Authorization header, validates the token against the store,
// and either calls next() (valid) or returns 401 (missing / invalid).
function requireToken(req, res, next) {
  const authHeader = req.get('authorization');
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const value = authHeader.slice('bearer '.length).trim();
  const token = store.getTokenByValue(value);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.token = token;
  return next();
}

module.exports = requireToken;
