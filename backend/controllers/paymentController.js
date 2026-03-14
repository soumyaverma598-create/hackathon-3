const pool = require('../config/db');

const submitPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod = 'online' } = req.body;
    const appRes = await pool.query('SELECT id FROM applications WHERE id = $1', [id]);
    if (appRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }
    const transactionId = `TXN-${Date.now()}`;
    const payId = 'pay' + Date.now();
    await pool.query(
      'INSERT INTO payments (id, application_id, amount, status, transaction_id, payment_method) VALUES ($1, $2, $3, $4, $5, $6)',
      [payId, id, amount, 'paid', transactionId, paymentMethod]
    );
    await pool.query(
      'UPDATE applications SET payment_status = $1, payment_amount = $2, payment_transaction_id = $3, updated_at = NOW() WHERE id = $4',
      ['paid', amount, transactionId, id]
    );
    return res.json({
      success: true,
      data: { transactionId, amount, paymentMethod, status: 'paid' },
    });
  } catch (err) {
    console.error('submitPayment error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

module.exports = { submitPayment };
