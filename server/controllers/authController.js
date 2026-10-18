const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { isDBConnected } = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// In-memory mock storage fallback when MongoDB daemon is not running
const memoryUsers = new Map();

// Helper to generate JWT token
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      city: user.city || '',
      organizationName: user.organizationName || ''
    }
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, city, organizationName, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    if (isDBConnected()) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists'
        });
      }

      const user = await User.create({
        name,
        email,
        password,
        role: role || 'citizen',
        city,
        organizationName,
        phone
      });

      sendTokenResponse(user, 201, res);
    } else {
      // In-memory fallback
      if (memoryUsers.has(email.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const mockUser = {
        _id: 'mock_user_' + Date.now(),
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role || 'citizen',
        city: city || '',
        organizationName: organizationName || '',
        phone: phone || ''
      };

      memoryUsers.set(mockUser.email, mockUser);
      sendTokenResponse(mockUser, 201, res);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    if (isDBConnected()) {
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      sendTokenResponse(user, 200, res);
    } else {
      // In-memory fallback
      const user = memoryUsers.get(email.toLowerCase());
      if (!user) {
        // Create demo account automatically for convenience
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
          _id: 'mock_' + Date.now(),
          name: email.split('@')[0],
          email: email.toLowerCase(),
          password: hashedPassword,
          role: email.includes('ngo') ? 'ngo' : 'citizen'
        };
        memoryUsers.set(email.toLowerCase(), newUser);
        return sendTokenResponse(newUser, 200, res);
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      sendTokenResponse(user, 200, res);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login'
    });
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
