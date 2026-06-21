/**
 * OptiCore Energy Solutions — Admin User Seeding Script
 *
 * Creates three admin accounts in the `Client` table:
 *   1. Julius Rey S. Gisto (opticore_owner)  — Founder & Principal, full CRM + Admin access
 *   2. Jeric Inson         (partner_admin)   — Cebu & Bohol Partner, Partner Portal access
 *   3. Aldrean T. Polistico (partner_admin)  — Eastern Visayas / SidlakDev, Partner Portal access
 *
 * Run with:
 *   DATABASE_URL=file:./prisma/dev.db npx tsx prisma/seed-admins.ts
 *
 * ⚠️  IMPORTANT: Change default passwords immediately after first login.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  return `bcrypt:${hash}`;
}

interface AdminUser {
  email: string;
  name: string;
  role: string;
  password: string;
}

const admins: AdminUser[] = [
  {
    email: 'julius@opticore.ph',
    name: 'Julius Rey S. Gisto, RME',
    role: 'opticore_owner',
    password: 'OptiCore@Owner2026!',
  },
  {
    email: 'jeric@opticore.ph',
    name: 'Jeric Inson',
    role: 'partner_admin',
    password: 'Jeric@Opti2026!',
  },
  {
    email: 'aldrean@opticore.ph',
    name: 'Aldrean T. Polistico',
    role: 'partner_admin',
    password: 'Aldrean@Opti2026!',
  },
];

async function main() {
  console.log('\n🌟 OptiCore Energy Solutions — Admin User Seeding\n');
  console.log('─'.repeat(55));

  for (const admin of admins) {
    const hashedPassword = await hashPassword(admin.password);

    await prisma.client.upsert({
      where: { email: admin.email },
      update: {
        name: admin.name,
        role: admin.role,
        passwordHash: hashedPassword,
        onboardingComplete: true,
        suspended: false,
      },
      create: {
        email: admin.email,
        name: admin.name,
        role: admin.role,
        passwordHash: hashedPassword,
        onboardingComplete: true,
        suspended: false,
        planTier: 'enterprise',
        consentGiven: true,
      },
    });

    console.log(`\n  ✅ ${admin.name}`);
    console.log(`     Role:     ${admin.role}`);
    console.log(`     Email:    ${admin.email}`);
    console.log(`     Password: ${admin.password}`);
    console.log(
      `     Portal:   ${
        admin.role === 'opticore_owner'
          ? 'https://yourdomain.com/crm  (full access + /admin)'
          : 'https://yourdomain.com/partner'
      }`
    );
  }

  console.log('\n' + '─'.repeat(55));
  console.log('\n📋 Login Summary\n');
  console.log('  Login URL: /login\n');

  for (const admin of admins) {
    console.log(`  ${admin.name}`);
    console.log(`    Email:    ${admin.email}`);
    console.log(`    Password: ${admin.password}\n`);
  }

  console.log('⚠️  CHANGE THESE PASSWORDS after first login.\n');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
