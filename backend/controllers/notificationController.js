const pool = require('../config/db');
const { sendNotificationEmail, sendApplicationStatusEmail } = require('../services/emailService');

const getAll = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    const data = result.rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      type: r.type || 'info',
      title: r.title || '',
      message: r.message || '',
      isRead: r.is_read === true,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : undefined,
      applicationId: r.application_id || undefined,
    }));
    return res.json({ success: true, data });
  } catch (err) {
    console.error('getNotifications error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

const markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }
    return res.json({ success: true, data: { id: result.rows[0].id, isRead: true } });
  } catch (err) {
    console.error('markRead error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * Send notification email to a user
 * Creates a notification in DB and sends email
 */
const sendNotification = async (req, res) => {
  try {
    const { userId, title, message, type = 'info', applicationId = null } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({ success: false, error: 'userId, title, and message are required' });
    }

    // Get user details
    const userResult = await pool.query('SELECT email, name FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Save notification to database
    const notifResult = await pool.query(
      'INSERT INTO notifications (user_id, type, title, message, application_id, is_read) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [userId, type, title, message, applicationId, false]
    );

    // Send email asynchronously
    sendNotificationEmail(user.email, title, message, type).catch(err => {
      console.error('Failed to send notification email:', err);
    });

    return res.json({
      success: true,
      message: 'Notification sent and stored',
      data: { id: notifResult.rows[0].id },
    });
  } catch (err) {
    console.error('sendNotification error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * Send application status update email
 * Creates a notification and sends status email
 */
const sendApplicationStatusNotification = async (req, res) => {
  try {
    const { userId, applicationId, status, remarks = '' } = req.body;

    if (!userId || !applicationId || !status) {
      return res.status(400).json({ success: false, error: 'userId, applicationId, and status are required' });
    }

    // Get user details
    const userResult = await pool.query('SELECT email, name FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Save notification to database
    const notifResult = await pool.query(
      'INSERT INTO notifications (user_id, type, title, message, application_id, is_read) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [userId, 'application-status', `Application Status: ${status}`, `Your application status has been updated to ${status}. ${remarks}`, applicationId, false]
    );

    // Send status email asynchronously
    sendApplicationStatusEmail(user.email, user.name, applicationId, status, remarks).catch(err => {
      console.error('Failed to send status email:', err);
    });

    return res.json({
      success: true,
      message: 'Status notification sent and stored',
      data: { id: notifResult.rows[0].id },
    });
  } catch (err) {
    console.error('sendApplicationStatusNotification error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

module.exports = { getAll, markRead, sendNotification, sendApplicationStatusNotification };
