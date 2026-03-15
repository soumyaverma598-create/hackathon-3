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
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
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
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};

const generateDoc = async (req, res) => {
  try {
    const { id } = req.params;
    const { appData, momData } = req.body;

    let app, mom;

    if (appData) {
      app = appData;
      mom = momData || { decision: '', conditions: '', notes: '' };
    } else {
      // Fallback to DB (only if appData not provided)
      const appRes = await pool.query('SELECT * FROM applications WHERE id = $1', [id]);
      if (appRes.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Application not found' });
      }
      app = appRes.rows[0];
      const momRes = await pool.query('SELECT * FROM mom WHERE application_id = $1', [id]);
      mom = momRes.rows[0] || { decision: '', conditions: '', notes: '' };
    }

    const safeId = id.replace(/\//g, '_');
    const filePath = path.join(pdfsDir, `mom-${safeId}-${Date.now()}.pdf`);
    await generateMomPdf(app, mom, filePath);

    // Try to update DB if possible, but don't fail if DB is offline
    try {
      const relativePath = path.relative(path.join(__dirname, '..', 'uploads'), filePath).replace(/\\/g, '/');
      await pool.query('UPDATE mom SET document_path = $1 WHERE application_id = $2', [relativePath, id]);
    } catch (e) { console.log('DB Update skipped (Post-through mode)'); }

    const downloadName = (app.application_number || id).replace(/\//g, '_');
    res.download(filePath, `MoM-${downloadName}.pdf`);
  } catch (err) {
    console.error('generateMomDoc error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};

const finalize = async (req, res) => {
  try {
    const { id } = req.params;
    const { appData } = req.body;

    let app;
    if (appData) {
      app = appData;
    } else {
      const appRes = await pool.query('SELECT * FROM applications WHERE id = $1', [id]);
      if (appRes.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Application not found' });
      }
      app = appRes.rows[0];
    }

    const safeId = id.replace(/\//g, '_');
    const certPath = path.join(pdfsDir, `ec-${safeId}-${Date.now()}.pdf`);
    await generateEcCertificatePdf(app, certPath);
    const relativePath = path.relative(path.join(__dirname, '..', 'uploads'), certPath).replace(/\\/g, '/');

    // Update DB with certificate path and status
    try {
      // Update applications table
      await pool.query("UPDATE applications SET status = 'finalized', finalized_at = NOW() WHERE id = $1", [id]);
      
      // Update or Insert into mom table to store the certificate path
      const momExist = await pool.query('SELECT id FROM mom WHERE application_id = $1', [id]);
      if (momExist.rows.length > 0) {
        await pool.query('UPDATE mom SET ec_certificate_path = $1 WHERE application_id = $2', [relativePath, id]);
      } else {
        const momId = 'mom' + Date.now();
        await pool.query(
          'INSERT INTO mom (id, application_id, ec_certificate_path) VALUES ($1, $2, $3)',
          [momId, id, relativePath]
        );
      }
    } catch (e) { 
      console.log('DB Update skipped or failed (Post-through mode):', e.message); 
    }

    return res.json({ success: true, data: { ecCertificatePath: relativePath } });
  } catch (err) {
    console.error('finalizeMom error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};

const downloadCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    let relPath;

    try {
      const momRes = await pool.query('SELECT ec_certificate_path FROM mom WHERE application_id = $1', [id]);
      if (momRes.rows.length > 0 && momRes.rows[0].ec_certificate_path) {
        relPath = momRes.rows[0].ec_certificate_path;
      }
    } catch (e) {
      console.log('DB Lookup failed for certificate, trying filesystem fallback...');
    }

    // Filesystem Fallback: If DB failed or no path found, look for ec-{safeId}-*.pdf
    if (!relPath) {
      const safeId = id.replace(/\//g, '_');
      const files = fs.readdirSync(pdfsDir);
      const matches = files
        .filter(f => f.startsWith(`ec-${safeId}-`) && f.endsWith('.pdf'))
        .sort((a, b) => b.localeCompare(a)); // Get latest based on filename (timestamp)
      
      if (matches.length > 0) {
        relPath = `pdfs/${matches[0]}`;
      }
    }

    if (!relPath) {
      return res.status(404).json({ success: false, error: 'Certificate not yet generated or found' });
    }

    const fullPath = path.join(path.join(__dirname, '..', 'uploads'), relPath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ success: false, error: 'Certificate file not found' });
    }
    
    const downloadName = id.replace(/\//g, '_');
    res.download(fullPath, `EC_Certificate_${downloadName}.pdf`);
  } catch (err) {
    console.error('downloadCertificate error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};

module.exports = { get, update, generateDoc, finalize, downloadCertificate };
