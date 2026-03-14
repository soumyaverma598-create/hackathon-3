/**
 * seedDemo.js — seeds demo credentials for PARIVESH 3.0
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./config/db');

const DEMO_USERS = [
  { id: 'u1', name: 'Admin Officer', email: 'admin@moef.gov.in', password: 'admin123', role: 'admin', department: 'MoEFCC Headquarters', designation: 'System Administrator' },
  { id: 'u2', name: 'Ravi Kumar', email: 'proponent@company.com', password: 'proponent123', role: 'applicant', department: 'Greenfield Infrastructure Pvt. Ltd.', designation: 'Project Manager' },
  { id: 'u3', name: 'Dr. Priya Sharma', email: 'scrutiny@moef.gov.in', password: 'scrutiny123', role: 'scrutiny', department: 'MoEFCC - Industry Division', designation: 'Senior Scientific Officer' },
  { id: 'u4', name: 'Suresh Menon', email: 'mom@moef.gov.in', password: 'mom123', role: 'mom', department: 'MoEFCC - EAC Secretariat', designation: 'Section Officer' },
];

async function seed() {
  const client = await pool.connect();
  try {
    for (const u of DEMO_USERS) {
      const hash = await bcrypt.hash(u.password, 10);
      await client.query(`
        INSERT INTO users (id, name, email, password_hash, role, department, designation)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (email) DO UPDATE SET password_hash = $4
      `, [u.id, u.name, u.email, hash, u.role, u.department, u.designation]);
    }
    // Seed sample applications for proponent
    const appCount = await client.query('SELECT COUNT(*) FROM applications');
    if (parseInt(appCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO applications (id, application_number, project_name, proponent_name, proponent_email, proponent_phone, project_category, project_sector, state_ut, district, project_cost, project_area, status, payment_status, payment_amount, payment_transaction_id, submitted_at, created_at, updated_at)
        VALUES
        ('app1', 'MoEFCC/EC/2026/00001', 'Greenfield Cement Plant – Phase II', 'Ravi Kumar', 'proponent@company.com', '9876543210', 'A', 'Cement', 'Rajasthan', 'Jodhpur', 4500000000, 250, 'eds_raised', 'paid', 50000, 'TXN2026012001', NOW() - INTERVAL '50 days', NOW() - INTERVAL '60 days', NOW()),
        ('app2', 'MoEFCC/EC/2026/00002', 'Solar Power Park – 200 MW', 'Ravi Kumar', 'proponent@company.com', '9876543210', 'B1', 'Power', 'Gujarat', 'Kutch', 1200000000, 500, 'draft', 'pending', NULL, NULL, NULL, NOW() - INTERVAL '10 days', NOW()),
        ('app3', 'MoEFCC/EC/2026/00005', 'fsfs', 'Ravi Kumar', 'proponent@company.com', '9876543210', 'B1', 'Road / Highway', 'Mizoram', 'Aizawl', 100000000, 50, 'submitted', 'pending', NULL, NULL, NOW(), NOW() - INTERVAL '5 days', NOW())
      `);
      await client.query(`
        INSERT INTO eds_queries (id, application_id, query_number, subject, description, raised_at, raised_by, status)
        VALUES ('eds1', 'app1', 'EDS-001', 'Water Requirement Details', 'Please provide detailed water balance sheet.', NOW() - INTERVAL '30 days', 'u3', 'open')
      `);
    }
    console.log('✅ Demo users and applications seeded');
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    throw err;
  } finally {
    client.release();
    process.exit(0);
  }
}

seed();
