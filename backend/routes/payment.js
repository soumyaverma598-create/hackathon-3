const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

const router = express.Router();

// JWT middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payment/create-order
router.post('/create-order', authenticateToken, async (req, res) => {
  try {
    const { applicationId, amount } = req.body;

    if (!applicationId || !amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Application ID and amount are required' 
      });
    }

    // Verify application exists and belongs to user
    const appResult = await pool.query(
      'SELECT id, proponent_email, payment_status FROM applications WHERE id = $1',
      [applicationId]
    );

    if (appResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Application not found' 
      });
    }

    const application = appResult.rows[0];

    // Check if user is the application owner
    if (application.proponent_email !== req.user.email) {
      return res.status(403).json({ 
        success: false, 
        error: 'You can only pay for your own applications' 
      });
    }

    // Check if payment is already completed
    if (application.payment_status === 'paid') {
      return res.status(400).json({ 
        success: false, 
        error: 'Payment already completed for this application' 
      });
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: applicationId,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    // Store order info in database
    await pool.query(
      'UPDATE applications SET payment_order_id = $1, payment_amount = $2 WHERE id = $3',
      [order.id, amount, applicationId]
    );

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: amount,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create payment order' 
    });
  }
});

// POST /api/payment/verify
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      application_id 
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !application_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'All payment details are required' 
      });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid payment signature' 
      });
    }

    // Verify application exists and belongs to user
    const appResult = await pool.query(
      'SELECT id, proponent_email, payment_amount FROM applications WHERE id = $1 AND payment_order_id = $2',
      [application_id, razorpay_order_id]
    );

    if (appResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Application not found or order mismatch' 
      });
    }

    const application = appResult.rows[0];

    // Check if user is the application owner
    if (application.proponent_email !== req.user.email) {
      return res.status(403).json({ 
        success: false, 
        error: 'Unauthorized' 
      });
    }

    // Update database with payment details
    await pool.query(
      `UPDATE applications 
       SET payment_id = $1, 
           payment_status = 'paid', 
           payment_date = NOW(),
           payment_transaction_id = $2,
           updated_at = NOW()
       WHERE id = $3`,
      [razorpay_payment_id, razorpay_payment_id, application_id]
    );

    res.json({
      success: true,
      data: {
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id,
        applicationId: application_id,
      },
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to verify payment' 
    });
  }
});

// GET /api/payment/status/:applicationId
router.get('/status/:applicationId', authenticateToken, async (req, res) => {
  try {
    const { applicationId } = req.params;

    const result = await pool.query(
      `SELECT payment_status, payment_amount, payment_date, payment_transaction_id, payment_order_id
       FROM applications 
       WHERE id = $1 AND proponent_email = $2`,
      [applicationId, req.user.email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Application not found' 
      });
    }

    const payment = result.rows[0];

    res.json({
      success: true,
      data: {
        status: payment.payment_status || 'pending',
        amount: payment.payment_amount,
        date: payment.payment_date,
        transactionId: payment.payment_transaction_id,
        orderId: payment.payment_order_id,
      },
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get payment status' 
    });
  }
});

module.exports = router;
