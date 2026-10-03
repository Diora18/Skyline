const jwt = require('jsonwebtoken');
const User = require('../models/User');

const optionalAuth = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return next();

  try {
    const token = authHeader.replace('Bearer ', '').trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'skyline-ssa-secret-key-2026');
    const user = await User.findById(decoded.id || decoded._id);
    if (user) req.user = user;
  } catch {
    // Public event browsing should continue when an optional token is stale.
  }
  return next();
};

module.exports = optionalAuth;
