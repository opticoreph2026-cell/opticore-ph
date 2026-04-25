import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import path from 'path';
import fs from 'fs';

async function testPrisma() {
  console.log('CWD:', process.cwd());
  
  // Test raw URL
  let dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
  console.log('Original dbUrl:', dbUrl);
  
  if (dbUrl.startsWith('file:')) {
    dbUrl = 'file:' + path.join(process.cwd(), 'dev.db');
  }
  
  console.log('Using dbUrl:', dbUrl);
  console.log('Does dev.db exist?', fs.existsSync(dbUrl.replace('file:', '')));

  const adapter = new PrismaLibSql({
    url: dbUrl,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const prisma = new PrismaClient({ adapter });

  try {
    const data = await prisma.applianceCatalog.findMany();
    console.log('Success! Found records:', data.length);
  } catch (e) {
    console.error('Prisma Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

testPrisma();
