const pool = require('./config/db');

pool.query('SELECT id, payment_status, payment_amount, payment_transaction_id FROM applications WHERE id = $1', ['app2']).then(res => {
  console.log('Payment status for app2:');
  const row = res.rows[0];
  console.log('Payment Status: ' + row.payment_status);
  console.log('Amount: ' + row.payment_amount);
  console.log('Transaction ID: ' + row.payment_transaction_id);
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
