const bcrypt = require('bcrypt');
const User = require('../models/User');
const { createToken } = require('../utils/token');

const cleanUser = (userDoc) => ({
  id: userDoc._id,
  name: userDoc.name,
  email: userDoc.email,
  cartData: Object.fromEntries(userDoc.cartData || new Map()),
  isAdmin: userDoc.isAdmin
});

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const isAdmin = process.env.ADMIN_EMAIL && email.toLowerCase().trim() === process.env.ADMIN_EMAIL.toLowerCase().trim();

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      isAdmin
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token: createToken(user),
      user: cleanUser(user)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    return res.json({
      success: true,
      message: 'Login successful',
      token: createToken(user),
      user: cleanUser(user)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, user: cleanUser(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile
};
