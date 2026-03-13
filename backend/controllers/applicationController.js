const pool = require('../config/db');

// Create a new application
const createApplication = async (req, res) => {
  const { applicant_id, project_name, project_description } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO "Application" (id, applicant_id, project_name, project_description, status, submitted_at, updated_at) 
       VALUES (gen_random_uuid(), $1, $2, $3, 'Pending', NOW(), NOW()) RETURNING *`,
      [applicant_id, project_name, project_description]
    );

    return res.status(201).json({
      message: 'Application created successfully',
      application: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating application:', error);
    return res.status(500).json({ message: 'Server error creating application' });
  }
};

// Get all applications
const getAllApplications = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Application" ORDER BY submitted_at DESC');
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return res.status(500).json({ message: 'Server error fetching applications' });
  }
};

// Get application by ID
const getApplicationById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM "Application" WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching application:', error);
    return res.status(500).json({ message: 'Server error fetching application' });
  }
};

// Update application status
const updateApplicationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE "Application" SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    return res.status(200).json({
      message: 'Application status updated',
      application: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating application:', error);
    return res.status(500).json({ message: 'Server error updating application' });
  }
};

module.exports = {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus
};
