const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '..', 'uploads');
const pdfsDir = path.join(uploadsDir, 'pdfs');
if (!fs.existsSync(pdfsDir)) fs.mkdirSync(pdfsDir, { recursive: true });

function generateMomPdf(app, mom, filePath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    doc.fontSize(18).text('Minutes of Meeting – Environmental Appraisal Committee', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Application: ${app.application_number}`);
    doc.text(`Project: ${app.project_name}`);
    doc.text(`Proponent: ${app.proponent_name}`);
    doc.moveDown();
    doc.fontSize(14).text('Project Summary', { underline: true });
    doc.fontSize(10).text(mom.notes || 'N/A');
    doc.moveDown();
    doc.fontSize(14).text('Decision', { underline: true });
    doc.fontSize(10).text(mom.decision || 'N/A');
    doc.moveDown();
    doc.fontSize(14).text('Conditions', { underline: true });
    doc.fontSize(10).text(mom.conditions || 'N/A');
    doc.moveDown(2);
    doc.fontSize(8).text('Government of India – MoEFCC – PARIVESH 3.0', { align: 'center' });
    doc.end();
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

function generateEcCertificatePdf(app, filePath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    doc.fontSize(20).text('ENVIRONMENTAL CLEARANCE CERTIFICATE', { align: 'center' });
    doc.moveDown(2);
    doc.fontSize(12);
    doc.text(`Application Number: ${app.application_number}`);
    doc.text(`Project Name: ${app.project_name}`);
    doc.text(`Proponent: ${app.proponent_name}`);
    doc.text(`Category: ${app.project_category}`);
    doc.text(`Location: ${app.district}, ${app.state_ut}`);
    doc.text(`Date of Grant: ${new Date().toISOString().slice(0, 10)}`);
    doc.moveDown();
    doc.text('Conditions of Clearance: As per EIA Notification 2006 and sector-specific guidelines.');
    doc.moveDown(2);
    doc.fontSize(8).text('Issued under EIA Notification 2006 – MoEFCC', { align: 'center' });
    doc.end();
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

module.exports = { generateMomPdf, generateEcCertificatePdf, pdfsDir };
