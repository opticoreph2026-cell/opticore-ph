/**
 * End-to-end login flow test script.
 * Tests: DB lookup → password verify → JWT sign → JWT verify
 * This reproduces exactly what the login API route + middleware do.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jose = require('jose');

// Load environment (same as Next.js does)
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local', override: true });

const prisma = new PrismaClient();

async function test() {
  console.log('=== OptiCore Login Flow Deep Debug ===\n');

  // ── Step 1: Check environment variables ────────────────────────────────────
  console.log('1. Checking environment variables...');
  const jwtSecret = process.env.JWT_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
  
  if (!jwtSecret) {
    console.error('   ❌ JWT_SECRET is NOT set');
    process.exit(1);
  }
  console.log(`   ✅ JWT_SECRET is set (${jwtSecret.length} chars)`);
  
  if (!jwtRefreshSecret) {
    console.error('   ❌ JWT_REFRESH_SECRET is NOT set — this would crash signRefreshToken()');
    process.exit(1);
  }
  console.log(`   ✅ JWT_REFRESH_SECRET is set (${jwtRefreshSecret.length} chars)`);

  // ── Step 2: Find admin user in database ────────────────────────────────────
  console.log('\n2. Looking up admin@opticore.ph in database...');
  const client = await prisma.client.findUnique({
    where: { email: 'admin@opticore.ph' }
  });

  if (!client) {
    console.error('   ❌ No client found with email admin@opticore.ph');
    process.exit(1);
  }
  console.log(`   ✅ Found client: id=${client.id}, role=${client.role}`);
  console.log(`   ✅ passwordHash starts with: ${client.passwordHash?.substring(0, 15)}...`);
  console.log(`   ✅ suspended=${client.suspended}, onboardingComplete=${client.onboardingComplete}`);

  // ── Step 3: Verify password ────────────────────────────────────────────────
  console.log('\n3. Verifying password "password123"...');
  const stored = client.passwordHash;
  
  if (!stored) {
    console.error('   ❌ passwordHash is null/empty');
    process.exit(1);
  }

  if (stored.startsWith('bcrypt:')) {
    console.log('   ℹ️  Hash format: bcrypt (correct)');
    const hash = stored.slice('bcrypt:'.length);
    console.log(`   ℹ️  bcrypt hash: ${hash.substring(0, 20)}...`);
    
    const valid = await bcrypt.compare('password123', hash);
    if (!valid) {
      console.error('   ❌ Password verification FAILED');
      // Try raw compare without prefix
      const rawValid = await bcrypt.compare('password123', stored);
      console.log(`   ℹ️  Raw compare (with prefix): ${rawValid}`);
      process.exit(1);
    }
    console.log('   ✅ Password verified successfully');
  } else {
    console.error(`   ❌ Unexpected hash format: ${stored.substring(0, 20)}...`);
    console.error('   Hash must start with "bcrypt:" prefix');
    process.exit(1);
  }

  // ── Step 4: Sign Access Token ──────────────────────────────────────────────
  console.log('\n4. Signing access token...');
  const secret = new TextEncoder().encode(jwtSecret);
  const payload = {
    sub: client.id,
    email: client.email,
    name: client.name,
    role: client.role,
    plan: client.planTier,
    onboarding_complete: client.onboardingComplete,
    suspended: client.suspended,
  };

  let accessToken;
  try {
    accessToken = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .setIssuer('opticore-ph')
      .sign(secret);
    console.log(`   ✅ Access token signed (${accessToken.length} chars)`);
  } catch (err) {
    console.error('   ❌ Failed to sign access token:', err.message);
    process.exit(1);
  }

  // ── Step 5: Sign Refresh Token ─────────────────────────────────────────────
  console.log('\n5. Signing refresh token...');
  const refreshSecret = new TextEncoder().encode(jwtRefreshSecret);
  let refreshToken;
  try {
    refreshToken = await new jose.SignJWT({ sub: client.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .setIssuer('opticore-ph')
      .sign(refreshSecret);
    console.log(`   ✅ Refresh token signed (${refreshToken.length} chars)`);
  } catch (err) {
    console.error('   ❌ Failed to sign refresh token:', err.message);
    process.exit(1);
  }

  // ── Step 6: Verify Access Token (simulates middleware) ─────────────────────
  console.log('\n6. Verifying access token (simulates middleware)...');
  try {
    const { payload: verified } = await jose.jwtVerify(accessToken, secret, {
      issuer: 'opticore-ph',
    });
    console.log(`   ✅ Token verified! sub=${verified.sub}, role=${verified.role}`);
  } catch (err) {
    console.error('   ❌ Middleware verification FAILED:', err.message);
    process.exit(1);
  }

  // ── Step 7: Check SignInEvent table exists ─────────────────────────────────
  console.log('\n7. Checking SignInEvent table...');
  try {
    const count = await prisma.signInEvent.count();
    console.log(`   ✅ SignInEvent table exists (${count} records)`);
  } catch (err) {
    console.error('   ❌ SignInEvent table error:', err.message);
  }

  // ── Step 8: Check RefreshToken table exists ────────────────────────────────
  console.log('\n8. Checking RefreshToken table...');
  try {
    const count = await prisma.refreshToken.count();
    console.log(`   ✅ RefreshToken table exists (${count} records)`);
  } catch (err) {
    console.error('   ❌ RefreshToken table error:', err.message);
  }

  console.log('\n=== All checks passed! Login should work. ===');
  console.log('\nAdmin credentials:');
  console.log('  Email:    admin@opticore.ph');
  console.log('  Password: password123');
}

test()
  .catch((e) => {
    console.error('\n❌ Unexpected error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
