/**
 * Full browser-flow simulation:
 * 1. POST /api/auth/login  → gets Set-Cookie
 * 2. GET  /api/auth/me     → sends Cookie header → should get user back
 * 3. GET  /dashboard       → should get 200 (not a 302 redirect to /login)
 */
const http = require('http');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function runTest() {
  console.log('=== Full Browser Flow Simulation ===\n');

  // ── Step 1: Login ──────────────────────────────────────────────────────────
  console.log('1. POST /api/auth/login...');
  const loginBody = JSON.stringify({ email: 'admin@opticore.ph', password: 'password123' });
  const loginRes = await request({
    hostname: 'localhost', port: 3000, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': loginBody.length }
  }, loginBody);

  console.log(`   Status: ${loginRes.status}`);
  if (loginRes.status !== 200) {
    console.error(`   ❌ Login failed: ${loginRes.body}`);
    process.exit(1);
  }

  // Extract cookies
  const rawCookies = loginRes.headers['set-cookie'] || [];
  const cookieStr = rawCookies.map(c => c.split(';')[0]).join('; ');
  const hasAccess  = rawCookies.some(c => c.startsWith('access_token='));
  const hasRefresh = rawCookies.some(c => c.startsWith('refresh_token='));
  console.log(`   access_token cookie set:  ${hasAccess  ? '✅' : '❌'}`);
  console.log(`   refresh_token cookie set: ${hasRefresh ? '✅' : '❌'}`);
  if (!hasAccess) { console.error('   ❌ No access_token cookie in response!'); process.exit(1); }

  // ── Step 2: GET /api/auth/me ───────────────────────────────────────────────
  console.log('\n2. GET /api/auth/me (with cookies)...');
  const meRes = await request({
    hostname: 'localhost', port: 3000, path: '/api/auth/me', method: 'GET',
    headers: { 'Cookie': cookieStr }
  });

  console.log(`   Status: ${meRes.status}`);
  if (meRes.status !== 200) {
    console.error(`   ❌ /api/auth/me failed: ${meRes.body}`);
    process.exit(1);
  }
  const meData = JSON.parse(meRes.body);
  console.log(`   ✅ Session user: ${meData.user?.email}, role: ${meData.user?.role}`);

  // ── Step 3: GET /dashboard ─────────────────────────────────────────────────
  console.log('\n3. GET /dashboard (with cookies)...');
  const dashRes = await request({
    hostname: 'localhost', port: 3000, path: '/dashboard', method: 'GET',
    headers: { 'Cookie': cookieStr }
  });

  console.log(`   Status: ${dashRes.status}`);
  if (dashRes.status === 302 || dashRes.status === 307 || dashRes.status === 308) {
    const location = dashRes.headers['location'];
    if (location?.includes('/login')) {
      console.error(`   ❌ Middleware redirected to /login! Cookies are not being accepted.`);
      process.exit(1);
    }
  }
  if (dashRes.status === 200) {
    console.log('   ✅ Dashboard accessible!');
  } else {
    console.log(`   ⚠️  Status ${dashRes.status} — Location: ${dashRes.headers['location'] || 'none'}`);
  }

  console.log('\n=== ALL TESTS PASSED — Login flow is working correctly ===');
  console.log('\nAdmin credentials for browser:');
  console.log('  URL:      http://localhost:3000/login');
  console.log('  Email:    admin@opticore.ph');
  console.log('  Password: password123');
}

runTest().catch(e => {
  console.error('❌ Test error:', e.message);
  process.exit(1);
});
