const http = require('http');

const loginOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
};

const req = http.request(loginOptions, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const data = JSON.parse(body);
    const token = data.token;
    
    const appOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/applications',
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    };
    
    http.get(appOptions, appRes => {
      let appBody = '';
      appRes.on('data', d => appBody += d);
      appRes.on('end', () => {
        console.log(appBody);
      });
    });
  });
});

req.write(JSON.stringify({ email: 'rahul.sharma@student.com', password: 'Student@123' }));
req.end();
