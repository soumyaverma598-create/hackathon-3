const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { sendWelcomeEmail } = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'parivesh_secret';

function mapUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    department: row.department || '',
    designation: row.designation || '',
    isActive: row.is_active !== false,
  };
}

const signup = async (req, res) => {
  try {
    const { name, email, password, role = 'applicant', department = '', designation = '' } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, department, designation, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, email.trim().toLowerCase(), hashedPassword, role, department, designation, true]
    );

    const newUser = result.rows[0];

    // Send welcome email asynchronously (don't wait for it)
    sendWelcomeEmail(newUser.email, newUser.name).catch(err => {
      console.error('Failed to send welcome email:', err);
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      success: true,
      message: 'User created successfully. Welcome email sent.',
      data: { token, user: mapUser(newUser) },
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    const row = result.rows[0];
    if (!row) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, row.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: row.id, email: row.email, role: row.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    return res.json({
      success: true,
      data: { token, user: mapUser(row) },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

const me = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const row = result.rows[0];
    if (!row) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    return res.json({
      success: true,
      data: mapUser(row),
    });
  } catch (err) {
    console.error('Me error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

module.exports = { signup, login, me };
