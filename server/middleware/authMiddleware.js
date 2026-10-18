const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isDBConnected } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'ngo_platform_jwt_secret_key_2026';

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route, please log in'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (isDBConnected()) {
      req.user = await User.findById(decoded.id);
    } else {
      // In-memory / offline mock user
      req.user = {
        _id: decoded.id,
        name: decoded.name || 'User',
        email: decoded.email,
        role: decoded.role || 'citizen'
      };
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token is invalid or expired'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'guest'}' is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize, JWT_SECRET };
