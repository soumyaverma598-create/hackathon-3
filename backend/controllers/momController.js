const pool = require('../config/db');
const path = require('path');
const fs = require('fs');
const { generateMomPdf, generateEcCertificatePdf, pdfsDir } = require('../services/momService');

function mapMom(row) {
  return {
    id: row.id,
    applicationId: row.application_id,
    decision: row.decision,
    conditions: row.conditions,
    notes: row.notes,
    documentPath: row.document_path,
    ecCertificatePath: row.ec_certificate_path,
    status: row.status,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
  };
}

const get = async (req, res) => {
  try {
    const { id } = req.params;
    const appRes = await pool.query('SELECT mom_content, meeting_date, meeting_number FROM applications WHERE id = $1', [id]);
    if (appRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }
    const app = appRes.rows[0];
    const momRes = await pool.query('SELECT notes, decision, conditions FROM mom WHERE application_id = $1', [id]);
    const mom = momRes.rows[0];
    const momContent = mom ? (mom.notes || mom.decision || mom.conditions || '') : (app.mom_content || '');
    const data = {
      momContent,
      meetingDate: app.meeting_date ? (typeof app.meeting_date === 'string' ? app.meeting_date : app.meeting_date.toISOString().slice(0, 10)) : undefined,
      meetingNumber: app.meeting_number || undefined,
    };
    return res.json({ success: true, data });
  } catch (err) {
    console.error('getMom error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { momContent, meetingDate, meetingNumber, decision, conditions, notes } = req.body;
    const appRes = await pool.query('SELECT id FROM applications WHERE id = $1', [id]);
    if (appRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }
    const content = momContent ?? notes ?? decision ?? '';
    const existRes = await pool.query('SELECT * FROM mom WHERE application_id = $1', [id]);
    if (existRes.rows.length > 0) {
      await pool.query(
        'UPDATE mom SET decision = $1, conditions = $2, notes = $3 WHERE application_id = $4',
        [decision ?? existRes.rows[0].decision, conditions ?? existRes.rows[0].conditions, content || notes || null, id]
      );
    } else {
      const momId = 'mom' + Date.now();
      await pool.query(
        'INSERT INTO mom (id, application_id, decision, conditions, notes) VALUES ($1, $2, $3, $4, $5)',
        [momId, id, decision || null, conditions || null, content || null]
      );
    }
    await pool.query(
      'UPDATE applications SET mom_content = $1, meeting_date = $2, meeting_number = $3, status = $4, updated_at = NOW() WHERE id = $5',
      [content, meetingDate || null, meetingNumber || null, 'mom_draft', id]
    );
    const updated = await pool.query('SELECT * FROM mom WHERE application_id = $1', [id]);
    return res.json({ success: true, data: mapMom(updated.rows[0]) });
  } catch (err) {
    console.error('updateMom error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

const generateDoc = async (req, res) => {
  try {
    const { id } = req.params;
    const appRes = await pool.query('SELECT * FROM applications WHERE id = $1', [id]);
    if (appRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }
    const momRes = await pool.query('SELECT * FROM mom WHERE application_id = $1', [id]);
    const mom = momRes.rows[0] || { decision: '', conditions: '', notes: '' };
    const filePath = path.join(pdfsDir, `mom-${id}-${Date.now()}.pdf`);
    await generateMomPdf(appRes.rows[0], mom, filePath);
    const relativePath = path.relative(path.join(__dirname, '..', 'uploads'), filePath).replace(/\\/g, '/');
    await pool.query(
      'UPDATE mom SET document_path = $1 WHERE application_id = $2',
      [relativePath, id]
    );
    if (momRes.rows.length === 0) {
      await pool.query(
        'INSERT INTO mom (id, application_id, document_path) VALUES ($1, $2, $3)',
        ['mom' + Date.now(), id, relativePath]
      );
    }
    res.download(filePath, `MoM-${id}.pdf`);
  } catch (err) {
    console.error('generateMomDoc error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

const finalize = async (req, res) => {
  try {
    const { id } = req.params;
    const appRes = await pool.query('SELECT * FROM applications WHERE id = $1', [id]);
    if (appRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }
    const app = appRes.rows[0];
    await pool.query(
      "UPDATE applications SET status = 'finalized', finalized_at = NOW(), updated_at = NOW() WHERE id = $1",
      [id]
    );
    const momRes = await pool.query('SELECT * FROM mom WHERE application_id = $1', [id]);
    let mom = momRes.rows[0];
    if (!mom) {
      await pool.query('INSERT INTO mom (id, application_id, status) VALUES ($1, $2, $3)', [
        'mom' + Date.now(),
        id,
        'approved',
      ]);
      mom = (await pool.query('SELECT * FROM mom WHERE application_id = $1', [id])).rows[0];
    } else {
      await pool.query("UPDATE mom SET status = 'approved' WHERE application_id = $1", [id]);
    }
    const certPath = path.join(pdfsDir, `ec-${id}-${Date.now()}.pdf`);
    await generateEcCertificatePdf(app, certPath);
    const relativePath = path.relative(path.join(__dirname, '..', 'uploads'), certPath).replace(/\\/g, '/');
    await pool.query('UPDATE mom SET ec_certificate_path = $1 WHERE application_id = $2', [relativePath, id]);
    return res.json({ success: true, data: { ecCertificatePath: relativePath } });
  } catch (err) {
    console.error('finalizeMom error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

const downloadCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const momRes = await pool.query('SELECT ec_certificate_path FROM mom WHERE application_id = $1', [id]);
    if (momRes.rows.length === 0 || !momRes.rows[0].ec_certificate_path) {
      return res.status(404).json({ success: false, error: 'Certificate not yet generated' });
    }
    const relPath = momRes.rows[0].ec_certificate_path;
    const fullPath = path.join(path.join(__dirname, '..', 'uploads'), relPath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ success: false, error: 'Certificate file not found' });
    }
    res.download(fullPath, `EC_Certificate_${id}.pdf`);
  } catch (err) {
    console.error('downloadCertificate error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

module.exports = { get, update, generateDoc, finalize, downloadCertificate };
