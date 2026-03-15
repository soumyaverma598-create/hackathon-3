const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '..', 'uploads');
const pdfsDir = path.join(uploadsDir, 'pdfs');
if (!fs.existsSync(pdfsDir)) fs.mkdirSync(pdfsDir, { recursive: true });

function generateMomPdf(app, mom, filePath) {
  if (!app) app = {};
  if (!mom) mom = {};
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        margin: 40,
        size: 'A4'
      });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // --- THEME COLORS ---
      const primaryTeal = '#164e63';
      const accentCyan = '#25c9d0';
      const lightBG = '#f8fafc';

      // --- BORDER ---
      doc.rect(20, 20, 555, 802).lineWidth(2).stroke(primaryTeal);
      doc.rect(25, 25, 545, 792).lineWidth(0.5).stroke(accentCyan);

      // --- HEADER ---
      doc.font('Times-Bold').fillColor(primaryTeal).fontSize(14).text('GOVERNMENT OF INDIA', 40, 45, { align: 'center' });
      doc.fontSize(11).text('Ministry of Environment, Forest and Climate Change', 40, 62, { align: 'center' });
      doc.fontSize(9).font('Times-Roman').fillColor('#666666').text('Indira Paryavaran Bhawan, Jor Bagh Road, New Delhi - 110003', 40, 78, { align: 'center' });
      
      doc.moveDown(1.5);
      const headerLineY = doc.y;
      doc.moveTo(40, headerLineY).lineTo(555, headerLineY).lineWidth(0.8).stroke(primaryTeal);
      doc.moveDown(1);

      // --- TITLE SECTION ---
      doc.fillColor('#000000').fontSize(18).font('Times-Bold').text('MINUTES OF MEETING', 40, doc.y, { align: 'center', characterSpacing: 1 });
      doc.fontSize(10).font('Times-Roman').fillColor('#444444').text(`Meeting No: ${app.meeting_number || 'EAC-2026/03'} | Date: ${app.meeting_date || new Date().toLocaleDateString('en-IN')}`, 40, doc.y + 2, { align: 'center' });
      doc.moveDown(1.5);

      // --- APPLICATION INFO BOX ---
      const infoBoxY = doc.y;
      doc.fillColor(lightBG).rect(40, infoBoxY, 515, 70).fill();
      doc.fillColor(primaryTeal).rect(40, infoBoxY, 5, 70).fill(); // Color accent on left
      
      doc.fillColor('#333333').font('Times-Bold').fontSize(10);
      doc.text('Project Name:', 55, infoBoxY + 10);
      doc.font('Times-Roman').text(app.project_name || app.projectName || 'Proposed Integrated Industrial Township', 140, infoBoxY + 10, { width: 400 });
      
      doc.font('Times-Bold').text('Application ID:', 55, infoBoxY + 28);
      doc.font('Times-Roman').text(app.application_number || app.applicationNumber || 'IA/PB/IND3/45231/2026', 140, infoBoxY + 28);
      
      doc.font('Times-Bold').text('Location:', 55, infoBoxY + 46);
      doc.font('Times-Roman').text(`${app.district || 'Ludhiana'}, ${app.state_ut || app.stateUT || 'Punjab'} (Cat: ${app.project_category || app.projectCategory || 'A'})`, 140, infoBoxY + 46);
      
      doc.moveDown(3.5);

      // --- CONTENT SECTIONS ---
      const sections = [
        { title: '1. PROJECT PROPOSAL & BACKGROUND', content: mom.momContent || mom.notes || 'The project proponent presented the detailed Environment Impact Assessment report. The project involves development of a greenfield industrial park over 500 hectares.' },
        { title: '2. EAC DELIBERATIONS', content: 'The Expert Appraisal Committee noted that the project is located within the designated industrial zone. The committee reviewed the biodiversity impact and local community feedback presented during the public hearing.' },
        { title: '3. RECOMMENDATIONS & DECISION', content: mom.decision || 'Based on the presentation and supporting documents, the Committee RECOMMENDS the proposal for grant of Environmental Clearance.' },
        { title: '4. TERMS & CONDITIONS', content: mom.conditions || 'Standard conditions for industrial townships apply. Green belt must cover at least 33% of the total area. Zero Liquid Discharge (ZLD) must be maintained.' }
      ];

      sections.forEach(s => {
        doc.fillColor(primaryTeal).font('Times-Bold').fontSize(11).text(s.title, 40, doc.y);
        doc.moveDown(0.3);
        doc.fillColor('#222222').font('Times-Roman').fontSize(10.5).text(s.content, 55, doc.y, { align: 'justify', width: 490 });
        doc.moveDown(1.2);
      });

      // --- SIGNATURE ---
      doc.moveDown(2);
      const sigY = doc.y;
      doc.fillColor('#000000').font('Times-Bold').fontSize(10.5).text('(Member Secretary, EAC)', 380, sigY);
      doc.font('Times-Roman').fontSize(9).text('Expert Appraisal Committee', 380, sigY + 14);
      doc.text('Ministry of Environment, Forest & CC', 380, sigY + 26);

      // --- WATERMARK ---
      doc.save();
      doc.opacity(0.04).fillColor(primaryTeal).fontSize(60).font('Times-Bold');
      doc.rotate(-45, { origin: [300, 400] });
      doc.text('PARIVESH 3.0', 150, 400);
      doc.restore();

      // --- FOOTER ---
      const footerY = 790;
      doc.moveTo(40, footerY).lineTo(555, footerY).lineWidth(0.5).stroke(accentCyan);
      doc.fontSize(8).fillColor('#888888').font('Times-Bold').text('THIS IS A DIGITALLY GENERATED DOCUMENT PRODUCED BY PARIVESH 3.0 PORTAL', 40, footerY + 10, { align: 'center' });
      doc.font('Times-Roman').text(`System ID: ${app.id || 'N/A'}-${Date.now()} | Page 1 of 1`, 40, footerY + 20, { align: 'center' });

      doc.end();
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    } catch (e) {
      reject(e);
    }
  });
}

function generateEcCertificatePdf(app, filePath) {
  if (!app) app = {};
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        margin: 40,
        size: 'A4'
      });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // --- THEME COLORS ---
      const primaryTeal = '#164e63';
      const accentCyan = '#25c9d0';
      const goldAccent = '#f7941d';

      // --- PREMIUM ORNATE BORDER ---
      doc.rect(15, 15, 565, 812).lineWidth(2.5).stroke(primaryTeal);
      doc.rect(20, 20, 555, 802).lineWidth(0.5).stroke(goldAccent);
      doc.rect(25, 25, 545, 792).lineWidth(1).stroke(accentCyan);

      // --- HEADER ---
      doc.font('Times-Bold').fillColor(primaryTeal).fontSize(16).text('GOVERNMENT OF INDIA', 40, 50, { align: 'center' });
      doc.fontSize(12).text('Ministry of Environment, Forest and Climate Change', 40, 68, { align: 'center' });
      doc.fontSize(10).font('Times-Roman').fillColor('#555555').text('(Impact Assessment Division)', 40, 82, { align: 'center' });
      doc.moveDown(1.5);

      // --- CERTIFICATE TITLE ---
      doc.fillColor('#000000').fontSize(24).font('Times-Bold').text('ENVIRONMENTAL CLEARANCE', 40, 115, { align: 'center', characterSpacing: 2 });
      doc.fontSize(9).font('Times-Roman').fillColor('#666666').text('Issued under the provisions of EIA Notification, 2006 as amended from time to time', 40, 142, { align: 'center' });
      
      doc.moveDown(2);
      const startBodyY = doc.y;

      // --- MAIN CONTENT ---
      doc.fillColor('#333333').font('Times-Roman').fontSize(11);
      doc.text('This is to certify that based on the application and subsequent deliberations of the Expert Appraisal Committee (EAC), the Ministry hereby accords Environmental Clearance to:', 60, startBodyY, { align: 'justify', width: 475 });
      
      doc.moveDown(0.8);
      doc.fillColor(primaryTeal).fontSize(15).font('Times-Bold').text(app.proponent_name || app.proponentName || 'Project Proponent Name', 60, doc.y, { align: 'center', width: 475 });
      
      doc.moveDown(0.8);
      doc.fillColor('#333333').fontSize(11).font('Times-Roman').text('For the development and establishment of the following project proposal:', 60, doc.y, { align: 'center', width: 475 });
      doc.moveDown(0.4);
      doc.fillColor('#000000').fontSize(13).font('Times-Bold').text(app.project_name || app.projectName || 'Proposed Project Title Details', 60, doc.y, { align: 'center', width: 475 });
      
      doc.moveDown(1.5);

      // --- METADATA TABLE ---
      const tableY = doc.y;
      const col1 = 70;
      const col2 = 230;
      const rowHeight = 22;

      doc.fillColor('#f1f5f9').rect(60, tableY, 475, rowHeight * 4).fill();
      doc.lineWidth(0.5).strokeColor('#e2e8f0');
      for(let i=0; i<=4; i++) {
        doc.moveTo(60, tableY + i*rowHeight).lineTo(535, tableY + i*rowHeight).stroke();
      }
      doc.moveTo(220, tableY).lineTo(220, tableY + 4*rowHeight).stroke();

      doc.fillColor(primaryTeal).font('Times-Bold').fontSize(10);
      doc.text('Application Reference', col1, tableY + 7);
      doc.text('Project Category & Sector', col1, tableY + 7 + rowHeight);
      doc.text('Location (District, State)', col1, tableY + 7 + 2*rowHeight);
      doc.text('Date of Issue', col1, tableY + 7 + 3*rowHeight);

      doc.fillColor('#000000').font('Times-Roman').fontSize(10);
      doc.text(app.application_number || app.applicationNumber || 'IA/PB/IND3/45231/2026', col2, tableY + 7);
      doc.text(`${app.project_category || app.projectCategory || 'A'} / ${app.project_sector || app.projectSector || 'Industrial Township'}`, col2, tableY + 7 + rowHeight);
      doc.text(`${app.district || 'Ludhiana'}, ${app.state_ut || app.stateUT || 'Punjab'}`, col2, tableY + 7 + 2*rowHeight);
      doc.text(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }), col2, tableY + 7 + 3*rowHeight);

      doc.moveDown(6);

      // --- CLOSING ---
      doc.fontSize(10.5).fillColor('#333333').text('The Environmental Clearance is subject to strict compliance of the specific and general conditions stipulated in the Minutes of Meeting. The project proponent must implement all environmental safeguards as per the approved EIA/EMP report.', 60, doc.y, { align: 'justify', width: 475 });
      
      doc.moveDown(3);

      // --- DIGITAL SIGNATURE ---
      const sigX = 350;
      doc.fillColor('#f8fafc').rect(sigX - 10, doc.y - 10, 195, 80).fill();
      doc.lineWidth(1).strokeColor(accentCyan).rect(sigX - 10, doc.y - 10, 195, 80).stroke();
      
      doc.fillColor(primaryTeal).font('Times-Bold').fontSize(10).text('DIGITALLY SIGNED BY:', sigX, doc.y);
      doc.fillColor('#000000').fontSize(11).text('Member Secretary, EAC', sigX, doc.y + 15);
      doc.fontSize(8.5).font('Times-Roman').text('Ministry of Environment, Forest & CC', sigX, doc.y + 30);
      doc.fontSize(8.5).text(`Timestamp: ${new Date().toISOString()}`, sigX, doc.y + 40);

      // --- WATERMARK ---
      doc.save();
      doc.opacity(0.04).fillColor(primaryTeal).fontSize(70).font('Times-Bold');
      doc.rotate(-45, { origin: [300, 420] });
      doc.text('E C - C E R T I F I C A T E', 50, 420);
      doc.restore();

      // --- FOOTER ---
      const footerY = 790;
      doc.fontSize(8).fillColor('#94a3b8').font('Times-Bold').text('THIS IS A DIGITALLY SIGNED CERTIFICATE. VALIDITY CAN BE VERIFIED VIA PARIVESH 3.0 QR CODE.', 40, footerY, { align: 'center' });
      doc.font('Times-Roman').text('PARIVESH 3.0 Portal | Indira Paryavaran Bhawan, New Delhi - 110003', 40, footerY + 12, { align: 'center' });

      doc.end();
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = { generateMomPdf, generateEcCertificatePdf, pdfsDir };
