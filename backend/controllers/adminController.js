const bcrypt = require('bcryptjs');
const pool = require('../config/db');

function mapUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    department: row.department || '',
    designation: row.designation || '',
    isActive: row.is_active !== false,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
  };
}

const getUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role, department, designation, is_active, created_at FROM users ORDER BY created_at');
    return res.json({ success: true, data: result.rows.map(mapUser) });
  } catch (err) {
    console.error('getUsers error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, designation, isActive } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, error: 'Name, email, password, role required' });
    }
    const emailLower = email.trim().toLowerCase();
    const exist = await pool.query('SELECT id FROM users WHERE email = $1', [emailLower]);
    if (exist.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' });
    }
    const hash = await bcrypt.hash(password, 10);
    const id = 'u' + Date.now();
    await pool.query(
      'INSERT INTO users (id, name, email, password_hash, role, department, designation, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [id, name.trim(), emailLower, hash, role, (department || '').trim(), (designation || '').trim(), isActive !== false]
    );
    const row = (await pool.query('SELECT * FROM users WHERE id = $1', [id])).rows[0];
    return res.status(201).json({ success: true, data: mapUser(row) });
  } catch (err) {
    console.error('createUser error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, department, designation, isActive } = req.body;
    const exist = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (exist.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const row = exist.rows[0];
    await pool.query(
      'UPDATE users SET name = $1, role = $2, department = $3, designation = $4, is_active = $5 WHERE id = $6',
      [
        name != null ? name.trim() : row.name,
        role != null ? role : row.role,
        department != null ? department.trim() : row.department,
        designation != null ? designation.trim() : row.designation,
        isActive != null ? isActive : row.is_active,
        id,
      ]
    );
    const updated = (await pool.query('SELECT * FROM users WHERE id = $1', [id])).rows[0];
    return res.json({ success: true, data: mapUser(updated) });
  } catch (err) {
    console.error('updateUser error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

const getConfig = async (req, res) => {
  const data = {
    projectCategories: ['A', 'B1', 'B2'],
    projectSectors: ['Mining', 'Power', 'Cement', 'Road / Highway', 'River Valley', 'Industrial Estate', 'Port / Harbour', 'Thermal Power', 'Petrochemical', 'Tourism'],
    statesUT: ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'],
    workflowStatuses: ['draft', 'submitted', 'under_scrutiny', 'eds_raised', 'referred', 'mom_draft', 'finalized'],
  };
  return res.json({ success: true, data });
};

module.exports = { getUsers, createUser, updateUser, getConfig };
