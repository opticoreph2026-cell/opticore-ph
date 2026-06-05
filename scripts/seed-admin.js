const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@opticore.ph';
  const password = 'password123';
  const name = 'System Admin';

  // IMPORTANT: Must prefix with "bcrypt:" so verifyPassword() in auth.js
  // knows to use bcryptjs.compare() instead of the legacy SHA-256 path.
  const rawHash = await bcrypt.hash(password, 10);
  const passwordHash = `bcrypt:${rawHash}`;

  const admin = await prisma.client.upsert({
    where: { email },
    update: {
      role: 'admin',
      passwordHash,
      suspended: false,
      onboardingComplete: true,
      planTier: 'business',
    },
    create: {
      email,
      name,
      passwordHash,
      role: 'admin',
      planTier: 'business',
      onboardingComplete: true,
      suspended: false,
    }
  });

  // Ensure AuthProvider exists
  await prisma.authProvider.upsert({
    where: {
      provider_providerId: {
        provider: 'PASSWORD',
        providerId: email
      }
    },
    update: {},
    create: {
      clientId: admin.id,
      provider: 'PASSWORD',
      providerId: email,
      email,
      emailVerified: true
    }
  });

  console.log(`Admin user seeded successfully!`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
