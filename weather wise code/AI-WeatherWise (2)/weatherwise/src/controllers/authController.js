const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const userPayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  token: generateToken(user._id)
});

// @route POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    const exists = await User.findOne({ email: String(email).toLowerCase() });
    if (exists) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists' });
    }

    // role is never taken from the request body
    const user = await User.create({ name, email, password });
    res.status(201).json({ success: true, data: userPayload(user) });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.status(200).json({ success: true, data: userPayload(user) });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
  const { _id, name, email, role } = req.user;
  res.json({ success: true, data: { _id, name, email, role } });
};

// @route PUT /api/auth/me
const updateMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    const { name, email, password } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;

    await user.save();
    res.json({ success: true, data: userPayload(user) });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateMe };
