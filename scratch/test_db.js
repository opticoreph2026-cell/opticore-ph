const { PrismaClient } = require('@prisma/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');
require('dotenv').config();

const dbUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

async function test() {
  console.log('Testing DB connection with LibSQL 0.8.0...');
  try {
    const client = createClient({ url: dbUrl, authToken: authToken });
    const adapter = new PrismaLibSQL(client);
    const prisma = new PrismaClient({ adapter });
    
    const users = await prisma.client.count();
    console.log('SUCCESS! User count:', users);
  } catch (err) {
    console.error('FAILED!', err);
  }
}

test();
