const { db } = require('../src/lib/db');

async function main() {
  try {
    const clients = await db.client.findMany();
    console.log('Total clients:', clients.length);
    console.log('Clients:', JSON.stringify(clients, null, 2));
    
    const count = await db.client.count({ where: { role: 'client' } });
    console.log('Clients with role "client":', count);
  } catch (error) {
    console.error('Error fetching clients:', error);
  } finally {
    await db.$disconnect();
  }
}

main();
