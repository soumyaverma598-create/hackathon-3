/**
 * initDB.js — creates PARIVESH 3.0 database schema (snake_case tables)
 */
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'parivesh',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
});

async function init() {
  const client = await pool.connect();
  try {
    await client.query(`
      DROP TABLE IF EXISTS notifications CASCADE;
      DROP TABLE IF EXISTS mom CASCADE;
      DROP TABLE IF EXISTS gists CASCADE;
      DROP TABLE IF EXISTS eds_queries CASCADE;
      DROP TABLE IF EXISTS payments CASCADE;
      DROP TABLE IF EXISTS documents CASCADE;
      DROP TABLE IF EXISTS applications CASCADE;
      DROP TABLE IF EXISTS users CASCADE;

      CREATE TABLE users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(32) NOT NULL CHECK (role IN ('admin','applicant','scrutiny','mom')),
        department VARCHAR(255) DEFAULT '',
        designation VARCHAR(255) DEFAULT '',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE applications (
        id VARCHAR(64) PRIMARY KEY,
        application_number VARCHAR(64) UNIQUE NOT NULL,
        project_name VARCHAR(500) NOT NULL,
        proponent_name VARCHAR(255) NOT NULL,
        proponent_email VARCHAR(255) NOT NULL,
        proponent_phone VARCHAR(32) DEFAULT '',
        project_category VARCHAR(16) NOT NULL CHECK (project_category IN ('A','B1','B2')),
        project_sector VARCHAR(255) DEFAULT '',
        state_ut VARCHAR(128) DEFAULT '',
        district VARCHAR(128) DEFAULT '',
        project_cost BIGINT DEFAULT 0,
        project_area NUMERIC DEFAULT 0,
        status VARCHAR(32) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','under_scrutiny','eds_raised','referred','mom_draft','finalized')),
        payment_status VARCHAR(32) DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','verified')),
        payment_amount NUMERIC,
        payment_transaction_id VARCHAR(128),
        remarks TEXT,
        meeting_date DATE,
        meeting_number VARCHAR(64),
        gist TEXT,
        mom_content TEXT,
        scrutiny_assigned_to VARCHAR(255),
        submitted_at TIMESTAMPTZ,
        finalized_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE documents (
        id VARCHAR(64) PRIMARY KEY,
        application_id VARCHAR(64) NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
        document_type VARCHAR(64) DEFAULT '',
        file_path VARCHAR(512) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        uploaded_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE payments (
        id VARCHAR(64) PRIMARY KEY,
        application_id VARCHAR(64) NOT NULL REFERENCES applications(id),
        amount NUMERIC NOT NULL,
        status VARCHAR(32) DEFAULT 'paid',
        transaction_id VARCHAR(128) NOT NULL,
        payment_method VARCHAR(64) DEFAULT 'online',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE eds_queries (
        id VARCHAR(64) PRIMARY KEY,
        application_id VARCHAR(64) NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
        query_number VARCHAR(32) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        description TEXT NOT NULL,
        raised_at TIMESTAMPTZ DEFAULT NOW(),
        raised_by VARCHAR(64) REFERENCES users(id),
        response TEXT,
        responded_at TIMESTAMPTZ,
        status VARCHAR(32) DEFAULT 'open' CHECK (status IN ('open','responded','closed'))
      );

      CREATE TABLE gists (
        id VARCHAR(64) PRIMARY KEY,
        application_id VARCHAR(64) UNIQUE NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        generated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE mom (
        id VARCHAR(64) PRIMARY KEY,
        application_id VARCHAR(64) UNIQUE NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
        decision TEXT,
        conditions TEXT,
        notes TEXT,
        document_path VARCHAR(512),
        ec_certificate_path VARCHAR(512),
        status VARCHAR(32) DEFAULT 'draft',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE notifications (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(32) DEFAULT 'info',
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        application_id VARCHAR(64)
      );

      CREATE INDEX IF NOT EXISTS idx_applications_proponent ON applications(proponent_email);
      CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
      CREATE INDEX IF NOT EXISTS idx_documents_application ON documents(application_id);
      CREATE INDEX IF NOT EXISTS idx_eds_application ON eds_queries(application_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
    `);
    console.log('✅ Database schema initialized');
  } catch (err) {
    console.error('❌ initDB error:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

init();
