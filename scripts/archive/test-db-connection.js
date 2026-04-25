const { getClientByEmail } = require('../src/lib/db');

async function test() {
  console.log('Testing DB connection via src/lib/db.js...');
  try {
    const admin = await getClientByEmail('admin@opticore.ph');
    console.log('Success! Found admin:', admin?.email);
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

test();
