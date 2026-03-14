const http = require('http');

// First get existing EDS queries
const getOptions = {
  hostname: 'localhost',
  port: 3002,
  path: '/applications/app2/eds',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InUyIiwiZW1haWwiOiJwcm9wb25lbnRAY29tcGFueS5jb20iLCJyb2xlIjoiYXBwbGljYW50IiwiaWF0IjoxNzczNDY1MjA4LCJleHAiOjE3NzM1NTE2MDh9.Sm5gJxP6B-AWlRmIpl-C0bNR1a9iEGTzyAr-OvDi4fM'
  }
};

const getReq = http.request(getOptions, (res) => {
  console.log('GET Status:', res.statusCode);
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    console.log('EDS Queries:', body);
    
    // Parse the response to get the first EDS query ID
    const data = JSON.parse(body);
    if (data.success && data.data.length > 0) {
      const edsId = data.data[0].id;
      console.log('Updating EDS query:', edsId);
      
      // Now update the EDS with a response
      const responseData = JSON.stringify({
        response: 'This is our detailed response to the EDS query with all required information.'
      });
      
      const updateOptions = {
        hostname: 'localhost',
        port: 3002,
        path: '/applications/app2/eds/' + edsId,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': responseData.length,
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InUyIiwiZW1haWwiOiJwcm9wb25lbnRAY29tcGFueS5jb20iLCJyb2xlIjoiYXBwbGljYW50IiwiaWF0IjoxNzczNDY1MjA4LCJleHAiOjE3NzM1NTE2MDh9.Sm5gJxP6B-AWlRmIpl-C0bNR1a9iEGTzyAr-OvDi4fM'
        }
      };
      
      const updateReq = http.request(updateOptions, (updateRes) => {
        console.log('UPDATE Status:', updateRes.statusCode);
        let updateBody = '';
        updateRes.on('data', (chunk) => {
          updateBody += chunk;
        });
        updateRes.on('end', () => {
          console.log('Update Response:', updateBody);
          process.exit(0);
        });
      });
      
      updateReq.on('error', (err) => {
        console.error('Update Error:', err.message);
        process.exit(1);
      });
      
      updateReq.write(responseData);
      updateReq.end();
    } else {
      console.log('No EDS queries found');
      process.exit(0);
    }
  });
});

getReq.on('error', (err) => {
  console.error('GET Error:', err.message);
  process.exit(1);
});

getReq.end();
