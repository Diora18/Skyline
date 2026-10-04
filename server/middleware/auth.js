const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Access denied. No authentication token provided.',
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Access denied. Empty authentication token.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'skyline-ssa-secret-key-2026');
    const user = await User.findById(decoded.id || decoded._id);

    if (!user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Invalid token. User no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Invalid or expired authentication token.',
    });
  }
};

module.exports = auth;
