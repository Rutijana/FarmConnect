const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// REGISTER
exports.register = async (req, res) => {
  const {
    phone, name, role, password,
    district, sector, farm_size,
    business_name, business_type
  } = req.body;

  try {
    // Check phone not already used
    const existing = await pool.query(
      'SELECT user_id FROM users WHERE phone = $1', [phone]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'This phone number is already registered.' });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (phone, name, role, password_hash)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [phone, name, role, password_hash]
    );
    const user = result.rows[0];

    // Create role-specific profile
    if (role === 'farmer') {
      await pool.query(
        `INSERT INTO farmers (farmer_id, district, sector, farm_size_hectares)
         VALUES ($1, $2, $3, $4)`,
        [user.user_id, district || null, sector || null, farm_size || 0]
      );
    } else if (role === 'buyer') {
      await pool.query(
        `INSERT INTO buyers (buyer_id, business_name, business_type)
         VALUES ($1, $2, $3)`,
        [user.user_id, business_name, business_type || null]
      );
    }

    const token = jwt.sign(
      { userId: user.user_id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful!',
      token,
      user: { id: user.user_id, name: user.name, role: user.role }
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
};

// LOGIN
exports.login = async (req, res) => {
  const { phone, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE phone = $1', [phone]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Phone number not found.' });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(400).json({ error: 'Incorrect password.' });
    }

    const token = jwt.sign(
      { userId: user.user_id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: { id: user.user_id, name: user.name, role: user.role }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed.' });
  }
};

// GET MY PROFILE
exports.getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT user_id, phone, name, role, is_verified, created_at FROM users WHERE user_id = $1',
      [req.user.userId]
    );
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch profile.' });
  }
};