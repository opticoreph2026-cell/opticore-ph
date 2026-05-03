import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';
import * as process from 'process';

// Force use of local SQLite path for reliability
const dbUrl = 'file:./dev.db';
const adapter = new PrismaLibSQL({
  url: dbUrl,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('[Maintenance] Restoring Admin Superuser account...');

  const email = 'admin@opticore.ph';
  const password = 'OptiCoreAdmin2024!'; // Temporary secure password
  const name = 'OptiCore Admin';

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.client.upsert({
      where: { email },
      update: {
        role: 'admin',
        passwordHash: hashedPassword,
        planTier: 'business',
        onboardingComplete: true
      },
      create: {
        email,
        name,
        passwordHash: hashedPassword,
        role: 'admin',
        planTier: 'business',
        onboardingComplete: true
      }
    });

    console.log('\n--- ADMIN RESTORED SUCCESSFULLY ---');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log('Role:     admin');
    console.log('Tier:     business');
    console.log('------------------------------------\n');
    console.log('You can now log in at /login.');

  } catch (error) {
    console.error('[Error] Failed to create admin account:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();
