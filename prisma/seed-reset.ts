import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SEED_EMAILS = [
  'julius@opticore.ph',
  'jeric@onsite-install.com',
  'aldrean@siddlak.com',
];

async function main() {
  console.log('Resetting non-seed client data...');

  const seedClients = await prisma.client.findMany({
    where: { email: { in: SEED_EMAILS } },
    select: { id: true },
  });
  const seedClientIds = seedClients.map((c) => c.id);

  const deleteOrder = [
    { name: 'EnergyPayments', model: prisma.energyPayment },
    { name: 'EnergyProjects', model: prisma.energyProject },
    { name: 'EnergyContracts', model: prisma.energyContract },
    { name: 'CommunicationsLogs', model: prisma.communicationsLog },
    { name: 'MaintenanceContracts', model: prisma.maintenanceContract },
    { name: 'EnergyQuotations', model: prisma.energyQuotation },
    { name: 'RoiScenarios', model: prisma.roiScenario },
    { name: 'SystemDesigns', model: prisma.systemDesign },
    { name: 'LoadAssessments', model: prisma.loadAssessment },
    { name: 'EnergySites', model: prisma.energySite },
    { name: 'EnergyCustomers', model: prisma.energyCustomer },
    { name: 'EnergyLeads', model: prisma.energyLead },
    { name: 'SignInEvents (non-seed)', model: prisma.signInEvent, where: { clientId: { notIn: seedClientIds } } },
    { name: 'AuthProviders (non-seed)', model: prisma.authProvider, where: { clientId: { notIn: seedClientIds } } },
    { name: 'EnergyProfiles (non-seed)', model: prisma.energyProfile, where: { clientId: { notIn: seedClientIds } } },
    { name: 'Clients (non-seed)', model: prisma.client, where: { id: { notIn: seedClientIds } } },
  ];

  for (const item of deleteOrder) {
    try {
      if (item.where) {
        await (item.model as any).deleteMany({ where: item.where });
      } else {
        await (item.model as any).deleteMany({});
      }
      console.log(`  ✓ Deleted ${item.name}`);
    } catch (err) {
      console.error(`  ✗ Failed to delete ${item.name}:`, err);
    }
  }

  console.log('Reset complete. Seed users preserved.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
