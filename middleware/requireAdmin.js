function requireAdmin(req, res, next) {
  if (!req.token || req.token.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  return next();
}

module.exports = requireAdmin;
