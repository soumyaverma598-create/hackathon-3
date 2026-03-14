const pool = require('../config/db');

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

module.exports = { getAll, markRead };
