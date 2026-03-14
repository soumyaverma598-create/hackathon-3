const http = require('http');

const data = JSON.stringify({
  amount: 50000,
  paymentMethod: 'online'
});

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/applications/app2/payment',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InUyIiwiZW1haWwiOiJwcm9wb25lbnRAY29tcGFueS5jb20iLCJyb2xlIjoiYXBwbGljYW50IiwiaWF0IjoxNzczNDY1MjA4LCJleHAiOjE3NzM1NTE2MDh9.Sm5gJxP6B-AWlRmIpl-C0bNR1a9iEGTzyAr-OvDi4fM'
  }
};

const req = http.request(options, (res) => {
  console.log('Status:', res.statusCode);
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    console.log('Response:', body);
    process.exit(0);
  });
});

req.on('error', (err) => {
  console.error('Error:', err.message);
  process.exit(1);
});

req.write(data);
req.end();
