const pool = require('./config/db');
const bcrypt = require('bcryptjs');

async function setup() {
  try {
    const adminExists = await pool.query('SELECT * FROM "User" WHERE email = $1', ['admin@test.com']);
    if (adminExists.rows.length === 0) {
      const hash = await bcrypt.hash('1234', 10);
      await pool.query(
        'INSERT INTO "User" (id, name, email, password_hash, role) VALUES (gen_random_uuid(), $1, $2, $3, $4)',
        ['Admin User', 'admin@test.com', hash, 'ADMIN']
      );
      console.log('✅ Admin user created: email: admin@test.com, pass: 1234');
    } else {
      console.log('✅ Admin already exists.');
    }

    const applicantExists = await pool.query('SELECT * FROM "User" WHERE email = $1', ['proponent@company.com']);
    if (applicantExists.rows.length === 0) {
      const hash = await bcrypt.hash('proponent123', 10);
      await pool.query(
        'INSERT INTO "User" (id, name, email, password_hash, role) VALUES (gen_random_uuid(), $1, $2, $3, $4)',
        ['Test Proponent', 'proponent@company.com', hash, 'APPLICANT']
      );
      console.log('✅ Proponent user created: email: proponent@company.com, pass: proponent123');
    } else {
      console.log('✅ Proponent already exists.');
    }

    pool.end();
  } catch (err) {
    console.error('Error:', err);
    pool.end();
  }
}

setup();
