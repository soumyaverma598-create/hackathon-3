const pool = require('../config/db');

const createQuery = async (req, res) => {
  const { application_id, raised_by, query_text } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO "EDSQuery" (id, application_id, raised_by, query_text, status, created_at) 
       VALUES (gen_random_uuid(), $1, $2, $3, 'Open', NOW()) RETURNING *`,
      [application_id, raised_by, query_text]
    );

    return res.status(201).json({
      message: 'EDS Query created',
      query: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating EDS query:', error);
    return res.status(500).json({ message: 'Server error creating EDS query' });
  }
};

const resolveQuery = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE "EDSQuery" SET status = 'Resolved', resolved_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'EDS Query not found' });
    }

    return res.status(200).json({
      message: 'EDS Query resolved',
      query: result.rows[0]
    });
  } catch (error) {
    console.error('Error resolving EDS query:', error);
    return res.status(500).json({ message: 'Server error resolving EDS query' });
  }
};

const getQueriesByApplicationId = async (req, res) => {
  const { applicationId } = req.params;

  try {
    const result = await pool.query('SELECT * FROM "EDSQuery" WHERE application_id = $1 ORDER BY created_at DESC', [applicationId]);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching EDS queries:', error);
    return res.status(500).json({ message: 'Server error fetching EDS queries' });
  }
};

module.exports = {
  createQuery,
  resolveQuery,
  getQueriesByApplicationId
};
