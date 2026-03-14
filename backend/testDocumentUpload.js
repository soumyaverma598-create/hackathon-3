const fs = require('fs');
const http = require('http');
const path = require('path');

// Create a test file
const testFilePath = path.join(__dirname, 'test.txt');
fs.writeFileSync(testFilePath, 'This is a test document');

// Read the file as buffer
const fileData = fs.readFileSync(testFilePath);

// Create multipart boundary
const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';

let body = '';
body += `--${boundary}\r\n`;
body += `Content-Disposition: form-data; name="document"; filename="test.txt"\r\n`;
body += `Content-Type: text/plain\r\n\r\n`;
body += fileData.toString();
body += `\r\n--${boundary}--\r\n`;

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/applications/app2/documents',
  method: 'POST',
  headers: {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': Buffer.byteLength(body),
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InUyIiwiZW1haWwiOiJwcm9wb25lbnRAY29tcGFueS5jb20iLCJyb2xlIjoiYXBwbGljYW50IiwiaWF0IjoxNzczNDY1MjA4LCJleHAiOjE3NzM1NTE2MDh9.Sm5gJxP6B-AWlRmIpl-C0bNR1a9iEGTzyAr-OvDi4fM'
  }
};

const req = http.request(options, (res) => {
  console.log('Status:', res.statusCode);
  let responseBody = '';
  res.on('data', (chunk) => {
    responseBody += chunk;
  });
  res.on('end', () => {
    console.log('Response:', responseBody);
    // Clean up test file
    fs.unlinkSync(testFilePath);
    process.exit(0);
  });
});

req.on('error', (err) => {
  console.error('Error:', err.message);
  fs.unlinkSync(testFilePath);
  process.exit(1);
});

req.write(body);
req.end();
