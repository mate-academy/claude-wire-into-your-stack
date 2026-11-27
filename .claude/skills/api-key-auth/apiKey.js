// Requires an `x-api-key` header that matches the API_KEY environment variable.
// - missing/empty header       -> 401 { error: 'API key is required' }
// - header does not match key  -> 401 { error: 'Invalid API key' }
// - API_KEY not configured     -> 500 { error: 'API key is not configured' } (fail closed)
const crypto = require('node:crypto');
const { Buffer } = require('node:buffer');

function safeEqual(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

function requireApiKey(req, res, next) {
  const expected = process.env.API_KEY;
  if (!expected) {
    return res.status(500).json({ error: 'API key is not configured' });
  }

  const apiKey = req.get('x-api-key');
  if (!apiKey || !apiKey.trim()) {
    return res.status(401).json({ error: 'API key is required' });
  }

  if (!safeEqual(apiKey, expected)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  return next();
}

module.exports = requireApiKey;
