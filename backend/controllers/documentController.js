const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/db');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safe = (file.originalname || 'file').replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});
const upload = multer({ storage });

const uploadMiddleware = upload.single('document');

const uploadDoc = async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    const documentType = req.body.documentType || req.body.document_type || 'EIA Report';
    const appRes = await pool.query('SELECT id FROM applications WHERE id = $1', [id]);
    if (appRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }
    const docId = 'doc' + Date.now();
    const relativePath = file.filename;
    await pool.query(
      'INSERT INTO documents (id, application_id, document_type, file_path, original_name) VALUES ($1, $2, $3, $4, $5)',
      [docId, id, documentType, relativePath, file.originalname]
    );
    const docRes = await pool.query('SELECT * FROM documents WHERE id = $1', [docId]);
    const row = docRes.rows[0];
    return res.status(201).json({
      success: true,
      data: {
        id: row.id,
        documentType: row.document_type,
        filePath: row.file_path,
        originalName: row.original_name,
        uploadedAt: row.uploaded_at ? new Date(row.uploaded_at).toISOString() : undefined,
      },
    });
  } catch (err) {
    console.error('uploadDoc error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};

const getByApplicationId = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM documents WHERE application_id = $1 ORDER BY uploaded_at DESC', [id]);
    const data = result.rows.map((r) => ({
      id: r.id,
      name: r.original_name,
      type: r.document_type || 'application/pdf',
      size: 0,
      url: '/uploads/' + r.file_path,
      uploadedAt: r.uploaded_at ? new Date(r.uploaded_at).toISOString() : undefined,
      uploadedBy: '',
    }));
    return res.json({ success: true, data });
  } catch (err) {
    console.error('getByApplicationId error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};

module.exports = { uploadMiddleware, uploadDoc, getByApplicationId };
