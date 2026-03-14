const pool = require('./config/db');

async function cleanupData() {
  try {
    // Delete test application
    const deleteResult = await pool.query('DELETE FROM applications WHERE project_name = $1', ['fsfs']);
    console.log('Deleted test application:', deleteResult.rowCount, 'rows');

    // Add proper third application
    const insertResult = await pool.query(`
      INSERT INTO applications (id, application_number, project_name, proponent_name, proponent_email, proponent_phone, project_category, project_sector, state_ut, district, project_cost, project_area, status, payment_status, created_at, updated_at) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
    `, [
      'app3', 
      'MoEFCC/EC/2026/00005', 
      'National Highway 48 – Widening', 
      'Ravi Kumar', 
      'proponent@company.com', 
      '9876543210', 
      'B2', 
      'Road / Highway', 
      'Maharashtra', 
      'Mumbai', 
      800000000, 
      120, 
      'referred', 
      'paid'
    ]);
    console.log('Added National Highway 48 application');

    // Show final applications
    const finalResult = await pool.query('SELECT id, project_name, status FROM applications ORDER BY id');
    console.log('\nFinal applications:');
    finalResult.rows.forEach(row => {
      console.log('ID: ' + row.id + ', Name: ' + row.project_name + ', Status: ' + row.status);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

cleanupData();
