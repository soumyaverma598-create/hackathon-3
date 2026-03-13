const pool = require('../config/db');

// Upload/create a document record
const uploadDocument = async (req, res) => {
  const { application_id, document_type, file_url } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO "Document" (id, application_id, document_type, file_url, uploaded_at) 
       VALUES (gen_random_uuid(), $1, $2, $3, NOW()) RETURNING *`,
      [application_id, document_type, file_url]
    );

    return res.status(201).json({
      message: 'Document uploaded successfully',
      document: result.rows[0]
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    return res.status(500).json({ message: 'Server error uploading document' });
  }
};

// Get documents by application ID
const getDocumentsByApplicationId = async (req, res) => {
  const { applicationId } = req.params;

  try {
    const result = await pool.query('SELECT * FROM "Document" WHERE application_id = $1 ORDER BY uploaded_at DESC', [applicationId]);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return res.status(500).json({ message: 'Server error fetching documents' });
  }
};

module.exports = {
  uploadDocument,
  getDocumentsByApplicationId
};
