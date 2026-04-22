const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@libsql/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const bcrypt = require('bcryptjs');

const fs = require('fs');
const path = require('path');

async function main() {
  // Manual .env parsing
  const envPath = path.join(__dirname, '..', '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)$/);
    if (match) {
        let val = match[2].trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        env[match[1].trim()] = val;
    }
  });

  const url = env.TURSO_DATABASE_URL;
  const authToken = env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in .env');
    process.exit(1);
  }

  const cleanUrl = url.split('?')[0];
  const client = createClient({ url: cleanUrl, authToken });

  const adminEmail = 'admin@opticore.ph';
  const adminPass = 'OptiCoreAdmin2026!';
  
  const salt = await bcrypt.genSalt(12);
  const passwordHash = `bcrypt:${await bcrypt.hash(adminPass, salt)}`;

  try {
    const existing = await client.execute({
        sql: 'SELECT id FROM Client WHERE email = ?',
        args: [adminEmail]
    });

    if (existing.rows.length > 0) {
        console.log(`Admin user already exists: ${adminEmail}`);
        await client.execute({
            sql: "UPDATE Client SET role = 'admin' WHERE email = ?",
            args: [adminEmail]
        });
        console.log('Role verified as admin.');
    } else {
        const id = require('crypto').randomUUID();
        await client.execute({
            sql: "INSERT INTO Client (id, email, name, passwordHash, role, consentGiven, onboardingComplete, updatedAt) VALUES (?, ?, ?, ?, ?, 1, 1, ?)",
            args: [id, adminEmail, 'OptiCore Admin', passwordHash, 'admin', new Date().toISOString()]
        });
        console.log(`Admin user created successfully!`);
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPass}`);
    }
  } catch (err) {
    console.error('Error creating admin:', err);
  } finally {
  }
}

main();
