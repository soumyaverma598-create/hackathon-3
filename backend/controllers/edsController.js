const pool = require('../config/db');

function mapEDS(row) {
  return {
    id: row.id,
    queryNumber: row.query_number,
    subject: row.subject,
    description: row.description,
    raisedAt: row.raised_at ? new Date(row.raised_at).toISOString() : undefined,
    raisedBy: row.raised_by,
    response: row.response || undefined,
    respondedAt: row.responded_at ? new Date(row.responded_at).toISOString() : undefined,
    status: row.status,
  };
}

const getByApplicationId = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM eds_queries WHERE application_id = $1 ORDER BY raised_at ASC', [id]);
    return res.json({ success: true, data: result.rows.map(mapEDS) });
  } catch (err) {
    console.error('getEDS error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

const create = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, description } = req.body;
    const appRes = await pool.query('SELECT id, status FROM applications WHERE id = $1', [id]);
    if (appRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }
    const countRes = await pool.query('SELECT COUNT(*) AS c FROM eds_queries WHERE application_id = $1', [id]);
    const count = parseInt(countRes.rows[0]?.c || '0', 10) + 1;
    const queryNumber = `EDS-${String(count).padStart(3, '0')}`;
    const qId = 'eds' + Date.now();
    await pool.query(
      `INSERT INTO eds_queries (id, application_id, query_number, subject, description, raised_at, raised_by, status)
       VALUES ($1, $2, $3, $4, $5, NOW(), $6, 'open')`,
      [qId, id, queryNumber, subject || '', description || '', req.user.id]
    );
    await pool.query(
      "UPDATE applications SET status = 'eds_raised', updated_at = NOW() WHERE id = $1 AND status != 'eds_raised'",
      [id]
    );
    const rowRes = await pool.query('SELECT * FROM eds_queries WHERE id = $1', [qId]);
    return res.status(201).json({ success: true, data: mapEDS(rowRes.rows[0]) });
  } catch (err) {
    console.error('createEDS error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

const update = async (req, res) => {
  try {
    const { id, queryId } = req.params;
    const { response, status } = req.body;
    const qRes = await pool.query(
      'SELECT * FROM eds_queries WHERE id = $1 AND application_id = $2',
      [queryId, id]
    );
    if (qRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'EDS query not found' });
    }
    const updates = [];
    const params = [];
    let idx = 1;
    if (response != null) {
      updates.push(`response = $${idx}, responded_at = NOW(), status = 'responded'`);
      params.push(response);
      idx++;
    }
    if (status && ['open', 'responded', 'closed'].includes(status)) {
      updates.push(`status = $${idx}`);
      params.push(status);
      idx++;
    }
    if (updates.length === 0) {
      const row = qRes.rows[0];
      return res.json({ success: true, data: mapEDS(row) });
    }
    params.push(queryId);
    await pool.query(
      `UPDATE eds_queries SET ${updates.join(', ')} WHERE id = $${idx}`,
      params
    );
    const rowRes = await pool.query('SELECT * FROM eds_queries WHERE id = $1', [queryId]);
    return res.json({ success: true, data: mapEDS(rowRes.rows[0]) });
  } catch (err) {
    console.error('updateEDS error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

module.exports = { getByApplicationId, create, update };
