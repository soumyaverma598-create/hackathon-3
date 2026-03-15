const pool = require('../config/db');

const VALID_STATUSES = ['draft', 'submitted', 'under_scrutiny', 'eds_raised', 'referred', 'mom_draft', 'finalized'];

function mapRowToApplication(row, edsRows = [], docRows = []) {
  const app = {
    id: row.id,
    applicationNumber: row.application_number,
    projectName: row.project_name,
    proponentName: row.proponent_name,
    proponentEmail: row.proponent_email,
    proponentPhone: row.proponent_phone || '',
    projectCategory: row.project_category,
    projectSector: row.project_sector || '',
    stateUT: row.state_ut || '',
    district: row.district || '',
    projectCost: parseInt(row.project_cost) || 0,
    projectArea: parseFloat(row.project_area) || 0,
    status: row.status,
    paymentStatus: row.payment_status || 'pending',
    paymentAmount: row.payment_amount ? parseFloat(row.payment_amount) : undefined,
    paymentTransactionId: row.payment_transaction_id || undefined,
    remarks: row.remarks || undefined,
    meetingDate: row.meeting_date ? (typeof row.meeting_date === 'string' ? row.meeting_date : row.meeting_date.toISOString().slice(0, 10)) : undefined,
    meetingNumber: row.meeting_number || undefined,
    gist: row.gist || undefined,
    momContent: row.mom_content || undefined,
    scrutinyAssignedTo: row.scrutiny_assigned_to || undefined,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
    submittedAt: row.submitted_at ? new Date(row.submitted_at).toISOString() : undefined,
    finalizedAt: row.finalized_at ? new Date(row.finalized_at).toISOString() : undefined,
    edsQueries: edsRows.map((r) => ({
      id: r.id,
      queryNumber: r.query_number,
      subject: r.subject,
      description: r.description,
      raisedAt: r.raised_at ? new Date(r.raised_at).toISOString() : undefined,
      raisedBy: r.raised_by,
      response: r.response || undefined,
      respondedAt: r.responded_at ? new Date(r.responded_at).toISOString() : undefined,
      status: r.status,
    })),
    documents: docRows.map((r) => ({
      id: r.id,
      name: r.original_name,
      type: r.document_type || 'application/pdf',
      size: 0,
      url: r.file_path,
      uploadedAt: r.uploaded_at ? new Date(r.uploaded_at).toISOString() : undefined,
      uploadedBy: '',
    })),
  };
  return app;
}

const getAll = async (req, res) => {
  try {
    let query = 'SELECT * FROM applications ORDER BY created_at DESC';
    const params = [];
    if (req.user.role === 'applicant') {
      query = 'SELECT * FROM applications WHERE proponent_email = $1 ORDER BY created_at DESC';
      params.push(req.user.email);
    }
    const result = await pool.query(query, params);
    const apps = [];
    for (const row of result.rows) {
      const edsRes = await pool.query('SELECT * FROM eds_queries WHERE application_id = $1 ORDER BY raised_at ASC', [row.id]);
      const docRes = await pool.query('SELECT * FROM documents WHERE application_id = $1', [row.id]);
      apps.push(mapRowToApplication(row, edsRes.rows, docRes.rows));
    }
    return res.json({ success: true, data: apps });
  } catch (err) {
    console.error('getAll error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const appRes = await pool.query('SELECT * FROM applications WHERE id = $1', [id]);
    const row = appRes.rows[0];
    if (!row) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }
    const edsRes = await pool.query('SELECT * FROM eds_queries WHERE application_id = $1 ORDER BY raised_at ASC', [id]);
    const docRes = await pool.query('SELECT * FROM documents WHERE application_id = $1', [id]);
    return res.json({ success: true, data: mapRowToApplication(row, edsRes.rows, docRes.rows) });
  } catch (err) {
    console.error('getById error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};

const create = async (req, res) => {
  try {
    const {
      projectName,
      proponentName,
      proponentEmail,
      proponentPhone,
      projectCategory,
      projectSector,
      stateUT,
      district,
      projectCost,
      projectArea,
    } = req.body;

    const name = (proponentName || req.user?.name || '').trim();
    const email = (proponentEmail || req.user?.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, error: 'Proponent email required' });
    }

    // Generate professional application ID
    function generateAppId(category, sequenceNumber) {
      const now = new Date();
      const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
      const financialYear = `${year}-${String(year + 1).slice(2)}`;
      const cat = category?.toLowerCase().includes('a') ? 'CAT-A' : 'CAT-B';
      const seq = String(sequenceNumber).padStart(4, '0');
      return `EC/${financialYear}/${cat}/${seq}`;
    }

    // Get sequence number
    const countResult = await pool.query('SELECT COUNT(*) FROM applications');
    const seq = parseInt(countResult.rows[0].count) + 1;
    const id = generateAppId(projectCategory, seq);
    await pool.query(
      `INSERT INTO applications (id, application_number, project_name, proponent_name, proponent_email, proponent_phone, project_category, project_sector, state_ut, district, project_cost, project_area, status, payment_status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'draft', 'pending', NOW(), NOW())`,
      [
        id,
        id, // Use the same professional ID for both id and application_number
        (projectName || '').trim(),
        name,
        email,
        (proponentPhone || '').trim(),
        projectCategory || 'B1',
        (projectSector || '').trim(),
        (stateUT || '').trim(),
        (district || '').trim(),
        parseInt(projectCost) || 0,
        parseFloat(projectArea) || 0,
      ]
    );
    const appRes = await pool.query('SELECT * FROM applications WHERE id = $1', [id]);
    const row = appRes.rows[0];
    return res.status(201).json({ success: true, data: mapRowToApplication(row, [], []) });
  } catch (err) {
    console.error('create error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    const appRes = await pool.query('SELECT * FROM applications WHERE id = $1', [id]);
    if (appRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }
    let q = 'UPDATE applications SET status = $1, updated_at = NOW()';
    const params = [status];
    let idx = 2;
    if (remarks != null) {
      q += `, remarks = $${idx}`;
      params.push(remarks);
      idx++;
    }
    if (status === 'submitted') {
      q += ', submitted_at = NOW()';
    }
    if (status === 'finalized') {
      q += ', finalized_at = NOW()';
    }
    q += ` WHERE id = $${idx}`;
    params.push(id);
    await pool.query(q, params);
    const updated = await pool.query('SELECT * FROM applications WHERE id = $1', [id]);
    const edsRes = await pool.query('SELECT * FROM eds_queries WHERE application_id = $1 ORDER BY raised_at ASC', [id]);
    const docRes = await pool.query('SELECT * FROM documents WHERE application_id = $1', [id]);
    return res.json({ success: true, data: mapRowToApplication(updated.rows[0], edsRes.rows, docRes.rows) });
  } catch (err) {
    console.error('updateStatus error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};

const submitApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE applications
       SET status = 'submitted',
           submitted_at = NOW(),
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, status`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }
    res.json({
      success: true,
      data: {
        id: result.rows[0].id,
        status: result.rows[0].status
      }
    });
  } catch (err) {
    console.error('submitApplication error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to submit application'
    });
  }
};

module.exports = { getAll, getById, create, updateStatus, submitApplication };
