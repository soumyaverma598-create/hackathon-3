const pool = require('../config/db');

// Create a Notification
const createNotification = async (req, res) => {
  const { user_id, message, type } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO "Notification" (id, user_id, message, type, is_read, created_at) 
       VALUES (gen_random_uuid(), $1, $2, $3, false, NOW()) RETURNING *`,
      [user_id, message, type]
    );

    return res.status(201).json({
      message: 'Notification created',
      notification: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating Notification:', error);
    return res.status(500).json({ message: 'Server error creating Notification' });
  }
};

const getNotificationsByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query('SELECT * FROM "Notification" WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching Notifications:', error);
    return res.status(500).json({ message: 'Server error fetching Notifications' });
  }
};

const markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE "Notification" SET is_read = true WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    return res.status(200).json({
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking Notification as read:', error);
    return res.status(500).json({ message: 'Server error marking Notification as read' });
  }
};

module.exports = {
  createNotification,
  getNotificationsByUserId,
  markAsRead
};
