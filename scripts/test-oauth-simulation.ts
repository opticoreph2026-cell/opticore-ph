
import { db } from '../src/lib/db';

async function simulateOAuth() {
  console.log('--- OAUTH INTEGRATION SIMULATION ---');
  
  const testEmail = 'oauth.tester@example.com';
  const googleId = 'google_test_123';

  // 1. Cleanup existing test data
  await db.client.deleteMany({ where: { email: testEmail } });
  console.log('✔ Cleanup: Done');

  // 2. Simulate CASE A: New User (Google Sign-Up)
  console.log('\nTesting CASE A: New Google Sign-Up...');
  const newUser = await db.client.create({
    data: {
      email: testEmail,
      name: 'OAuth Tester',
      emailVerified: new Date(),
      lastSignedInAt: new Date(),
      authProviders: {
        create: {
          provider: 'GOOGLE',
          providerId: googleId,
          email: testEmail,
          emailVerified: true,
        }
      },
      properties: { create: { name: 'Main Home' } }
    },
    include: { authProviders: true }
  });
  console.log(`✔ Success: Created new user with ID ${newUser.id}`);
  console.log(`✔ AuthProviders count: ${newUser.authProviders.length}`);

  // 3. Simulate CASE B: Account Linking (Add Password)
  console.log('\nTesting CASE B: Linking Password to Google Account...');
  await db.authProvider.create({
    data: {
      clientId: newUser.id,
      provider: 'PASSWORD',
      providerId: testEmail,
      email: testEmail,
    }
  });
  const updatedUser = await db.client.findUnique({
    where: { id: newUser.id },
    include: { authProviders: true }
  });
  console.log(`✔ Success: Account now has ${updatedUser.authProviders.length} providers`);
  console.log(`Providers: ${updatedUser.authProviders.map((p: any) => p.provider).join(', ')}`);

  // 4. Simulate SignInEvent Logging
  console.log('\nTesting SignInEvent logging...');
  const event = await db.signInEvent.create({
    data: {
      clientId: newUser.id,
      provider: 'GOOGLE',
      ipAddress: '127.0.0.1',
      userAgent: 'Simulation Script',
      success: true
    }
  });
  console.log(`✔ Success: Created event record ${event.id}`);

  // 5. Test Unlink Logic
  console.log('\nTesting Unlink (Remove Google)...');
  await db.$transaction([
    db.authProvider.delete({
      where: { provider_providerId: { provider: 'GOOGLE', providerId: googleId } }
    }),
    db.refreshToken.deleteMany({ where: { clientId: newUser.id } })
  ]);
  
  const finalUser = await db.client.findUnique({
    where: { id: newUser.id },
    include: { authProviders: true }
  });
  console.log(`✔ Success: Account now has ${finalUser.authProviders.length} providers`);
  console.log(`Final Providers: ${finalUser.authProviders.map((p: any) => p.provider).join(', ')}`);

  console.log('\n--- ALL TESTS PASSED ---');
}

simulateOAuth().catch(console.error);
