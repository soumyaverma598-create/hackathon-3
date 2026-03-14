const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/applications/app2/mom/generate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InU0IiwiZW1haWwiOiJtb21AbW9lZi5nb3YuaW4iLCJyb2xlIjoibW9tIiwiaWF0IjoxNzczNDY1MjA4LCJleHAiOjE3NzM1NTE2MDh9.9QYVjCKp9q6L8QWxKGhT8K1xh9j6B6X0J3K5J2M5X0Y'
  }
};

const req = http.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  if (res.statusCode === 200) {
    // Handle PDF download
    const fileName = 'test-mom.pdf';
    const fileStream = require('fs').createWriteStream(fileName);
    res.pipe(fileStream);
    
    fileStream.on('finish', () => {
      console.log('MoM PDF downloaded successfully as', fileName);
      process.exit(0);
    });
    
    fileStream.on('error', (err) => {
      console.error('File write error:', err);
      process.exit(1);
    });
  } else {
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      console.log('Error Response:', body);
      process.exit(1);
    });
  }
});

req.on('error', (err) => {
  console.error('Request error:', err.message);
  process.exit(1);
});

req.end();
