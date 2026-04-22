import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import path from 'path';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const dbPath = path.join(process.cwd(), 'dev.db');
const dbUrl = `file:${dbPath}`;

const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = 'admin@opticore.ph';
  const adminPass = 'OptiCoreAdmin2026!';
  
  const salt = await bcrypt.genSalt(12);
  const passwordHash = `bcrypt:${await bcrypt.hash(adminPass, salt)}`;

  try {
    const existing = await prisma.client.findUnique({
      where: { email: adminEmail }
    });

    if (existing) {
      console.log(`Admin user already exists: ${adminEmail}`);
      await prisma.client.update({
        where: { email: adminEmail },
        data: { role: 'admin', passwordHash } // update password too just in case
      });
      console.log('Role verified as admin and password reset.');
    } else {
      const id = randomUUID();
      await prisma.client.create({
        data: {
          id,
          email: adminEmail,
          name: 'OptiCore Admin',
          passwordHash,
          role: 'admin',
          consentGiven: true,
          onboardingComplete: true
        }
      });
      console.log(`Admin user created successfully!`);
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPass}`);
    }
  } catch (err) {
    console.error('Error creating admin:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
