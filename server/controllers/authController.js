const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'skyline-ssa-secret-key-2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, studentId, phone, major, graduationYear } = req.body;

    if (!name || !email || !password || !studentId) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Name, email, password, and studentId are required.',
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { studentId: studentId.trim() }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        data: null,
        message: existingUser.email === email.toLowerCase()
          ? 'An account with this email already exists.'
          : 'An account with this Student ID already exists.',
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      studentId: studentId.trim(),
      phone: phone || '',
      major: major || '',
      graduationYear: graduationYear ? Number(graduationYear) : undefined,
      role: 'student',
      membershipStatus: 'none',
    });

    const token = signToken(user._id);

    // Return user without password
    const userJson = user.toObject();
    delete userJson.password;

    res.status(201).json({
      success: true,
      data: {
        token,
        user: userJson,
      },
      message: 'Registration successful',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error during registration',
    });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Invalid email or password',
      });
    }

    // Auto-check membership expiration on login
    if (user.membershipStatus === 'active' && user.membershipExpiresAt) {
      if (new Date() > new Date(user.membershipExpiresAt)) {
        user.membershipStatus = 'expired';
        await user.save();
      }
    }

    const token = signToken(user._id);

    const userJson = user.toObject();
    delete userJson.password;

    res.status(200).json({
      success: true,
      data: {
        token,
        user: userJson,
      },
      message: 'Login successful',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error during login',
    });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'User profile not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
      message: 'User fetched',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error fetching user profile',
    });
  }
};
