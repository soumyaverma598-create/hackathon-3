const http = require('http');

// First login as MoM to get fresh token
const loginData = JSON.stringify({
  email: 'mom@moef.gov.in',
  password: 'mom123'
});

const loginOptions = {
  hostname: 'localhost',
  port: 3002,
  path: '/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

const loginReq = http.request(loginOptions, (loginRes) => {
  console.log('Login Status:', loginRes.statusCode);
  let loginBody = '';
  loginRes.on('data', (chunk) => {
    loginBody += chunk;
  });
  loginRes.on('end', () => {
    try {
      const loginResponse = JSON.parse(loginBody);
      if (loginResponse.success && loginResponse.data.token) {
        const token = loginResponse.data.token;
        console.log('Got MoM token');
        
        // Now test MoM PDF generation
        const pdfOptions = {
          hostname: 'localhost',
          port: 3002,
          path: '/applications/app2/mom/generate',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          }
        };

        const pdfReq = http.request(pdfOptions, (pdfRes) => {
          console.log('PDF Status:', pdfRes.statusCode);
          
          if (pdfRes.statusCode === 200) {
            const fileName = 'test-mom.pdf';
            const fileStream = require('fs').createWriteStream(fileName);
            pdfRes.pipe(fileStream);
            
            fileStream.on('finish', () => {
              console.log('MoM PDF downloaded successfully as', fileName);
              process.exit(0);
            });
            
            fileStream.on('error', (err) => {
              console.error('File write error:', err);
              process.exit(1);
            });
          } else {
            let pdfBody = '';
            pdfRes.on('data', (chunk) => {
              pdfBody += chunk;
            });
            pdfRes.on('end', () => {
              console.log('PDF Error Response:', pdfBody);
              process.exit(1);
            });
          }
        });

        pdfReq.on('error', (err) => {
          console.error('PDF Request error:', err.message);
          process.exit(1);
        });

        pdfReq.end();
      } else {
        console.log('Login failed:', loginBody);
        process.exit(1);
      }
    } catch (err) {
      console.error('Login response parse error:', err);
      process.exit(1);
    }
  });
});

loginReq.on('error', (err) => {
  console.error('Login request error:', err.message);
  process.exit(1);
});

loginReq.write(loginData);
loginReq.end();
