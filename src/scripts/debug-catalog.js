const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugSystem() {
  console.log('--- OptiCore PH System Deep Debug ---');
  try {
    const clients = await prisma.client.count();
    const catalog = await prisma.applianceCatalog.count();
    const readings = await prisma.utilityReading.count();
    const appliances = await prisma.appliance.count();

    console.log(`- Clients: ${clients}`);
    console.log(`- ApplianceCatalog: ${catalog}`);
    console.log(`- UtilityReadings: ${readings}`);
    console.log(`- User Appliances: ${appliances}`);

    if (catalog === 0) {
      console.error('CRITICAL: ApplianceCatalog is EMPTY. The master seed has not been run or failed.');
    }

    const firstFive = await prisma.applianceCatalog.findMany({ take: 5 });
    console.log('- Sample Catalog Items:', JSON.stringify(firstFive, null, 2));

  } catch (err) {
    console.error('DATABASE ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

debugSystem();
