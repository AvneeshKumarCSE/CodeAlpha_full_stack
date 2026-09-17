const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbGet, dbRun } = require('../config/database');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const register = async (req, res) => {
  try {
    const { name, username, email, password, bio, avatar } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, username, email, and password.' });
    }

    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
    const cleanEmail = email.toLowerCase().trim();

    if (cleanUsername.length < 3) {
      return res.status(400).json({ success: false, message: 'Username must be at least 3 alphanumeric characters.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    // Check existing
    const existing = await dbGet('SELECT id, email, username FROM users WHERE email = ? OR username = ?', [cleanEmail, cleanUsername]);
    if (existing) {
      if (existing.email === cleanEmail) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }
      return res.status(400).json({ success: false, message: 'This username is already taken. Please choose another.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultAvatar = avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanUsername}`;

    const result = await dbRun(
      'INSERT INTO users (name, username, email, password, bio, avatar) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), cleanUsername, cleanEmail, hashedPassword, bio || 'Hey there! I am on CodeAlpha Social.', defaultAvatar]
    );

    const user = {
      id: result.id,
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      avatar: defaultAvatar
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or username

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username/email and password.' });
    }

    const cleanIdentifier = identifier.toLowerCase().trim();
    const user = await dbGet(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [cleanIdentifier, cleanIdentifier]
    );

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const userPayload = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: userPayload
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await dbGet(
      'SELECT id, name, username, email, bio, avatar, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const followersCount = (await dbGet('SELECT COUNT(*) as c FROM follows WHERE following_id = ?', [user.id])).c;
    const followingCount = (await dbGet('SELECT COUNT(*) as c FROM follows WHERE follower_id = ?', [user.id])).c;
    const postsCount = (await dbGet('SELECT COUNT(*) as c FROM posts WHERE user_id = ?', [user.id])).c;

    res.json({
      success: true,
      user: {
        ...user,
        followersCount,
        followingCount,
        postsCount
      }
    });
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
};

module.exports = {
  register,
  login,
  getMe
};
