const pool = require('../config/db');

function formatGist(app) {
  const costLakhs = app.project_cost ? (parseInt(app.project_cost) / 100000).toFixed(2) : '0';
  const submittedStr = app.submitted_at
    ? new Date(app.submitted_at).toISOString().slice(0, 10)
    : 'Not submitted';
  return `Project Gist – ${app.project_name || 'N/A'}
Category: ${app.project_category || 'N/A'} | Sector: ${app.project_sector || 'N/A'}
Location: ${app.district || ''}, ${app.state_ut || ''}
Cost: ₹${costLakhs} Lakhs | Area: ${app.project_area || 0} Ha
Status: ${app.status || 'N/A'} | Submitted: ${submittedStr}

Summary: This project requires Environmental Clearance under the EIA Notification, 2006. The EAC has reviewed the application and relevant baseline data. Site visit completed. Public hearing conducted as per regulatory requirements.`;
}

const generate = async (req, res) => {
  try {
    const { id } = req.params;
    const appRes = await pool.query('SELECT * FROM applications WHERE id = $1', [id]);
    if (appRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }
    const app = appRes.rows[0];
    const content = formatGist(app);
    const gistId = 'gist' + Date.now();
    await pool.query('DELETE FROM gists WHERE application_id = $1', [id]);
    await pool.query(
      'INSERT INTO gists (id, application_id, content, generated_at) VALUES ($1, $2, $3, NOW())',
      [gistId, id, content]
    );
    await pool.query('UPDATE applications SET gist = $1, updated_at = NOW() WHERE id = $2', [content, id]);
    const gRes = await pool.query('SELECT * FROM gists WHERE application_id = $1', [id]);
    const row = gRes.rows[0];
    const data = {
      id: row.id,
      applicationId: id,
      projectBackground: content.split('\n').slice(0, 4).join('\n'),
      proposalDetails: content.split('\n').slice(4, 6).join('\n'),
      environmentalImpact: 'Detailed EIA as per EIA Notification, 2006.',
      mitigationMeasures: 'Standard mitigation measures as per MoEFCC guidelines.',
      recommendation: 'Project recommended for consideration of grant of Environmental Clearance.',
      generatedAt: row.generated_at ? new Date(row.generated_at).toISOString() : undefined,
      isLocked: false,
    };
    return res.json({ success: true, data });
  } catch (err) {
    console.error('generateGist error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};

const getByApplicationId = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM gists WHERE application_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.json({ success: true, data: null });
    }
    const row = result.rows[0];
    const content = row.content || '';
    const data = {
      id: row.id,
      applicationId: id,
      projectBackground: content.split('\n').slice(0, 4).join('\n'),
      proposalDetails: content.split('\n').slice(4, 6).join('\n'),
      environmentalImpact: 'Detailed EIA as per EIA Notification, 2006.',
      mitigationMeasures: 'Standard mitigation measures as per MoEFCC guidelines.',
      recommendation: 'Project recommended for consideration of grant of Environmental Clearance.',
      generatedAt: row.generated_at ? new Date(row.generated_at).toISOString() : undefined,
      isLocked: false,
    };
    return res.json({ success: true, data });
  } catch (err) {
    console.error('getGist error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};

module.exports = { generate, getByApplicationId };
