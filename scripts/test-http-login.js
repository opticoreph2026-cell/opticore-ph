// Quick HTTP test for the login endpoint
const https = require('https');

const data = JSON.stringify({
  email: 'admin@opticore.ph',
  password: 'password123'
});

const APP_URL = 'https://opticore-ph.vercel.app';
const options = {
  hostname: 'opticore-ph.vercel.app',
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers['set-cookie'] || 'none')}`);
    console.log(`Body: ${body}`);
    
    if (res.statusCode === 200) {
      console.log('\n✅ LOGIN SUCCESSFUL!');
      // Check if cookies were set
      const cookies = res.headers['set-cookie'];
      if (cookies) {
        const hasAccess = cookies.some(c => c.startsWith('access_token='));
        const hasRefresh = cookies.some(c => c.startsWith('refresh_token='));
        console.log(`   access_token cookie: ${hasAccess ? '✅' : '❌'}`);
        console.log(`   refresh_token cookie: ${hasRefresh ? '✅' : '❌'}`);
      } else {
        console.log('   ⚠️ No Set-Cookie headers found');
      }
    } else {
      console.log(`\n❌ LOGIN FAILED with status ${res.statusCode}`);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Connection error: ${e.message}`);
  console.error('   Is the dev server running? (npm run dev)');
});

req.write(data);
req.end();
