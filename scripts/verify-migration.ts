import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const stats: any[] = await prisma.$queryRaw`
    SELECT 
      (SELECT COUNT(*) FROM Client) as total_clients,
      (SELECT COUNT(DISTINCT clientId) FROM AuthProvider) as clients_with_providers,
      (SELECT COUNT(*) FROM Client WHERE passwordHash IS NULL) as oauth_only_users,
      (SELECT COUNT(*) FROM AuthProvider WHERE provider = 'PASSWORD') as password_providers,
      (SELECT COUNT(*) FROM AuthProvider WHERE provider = 'GOOGLE') as google_providers;
  `;

  const result = stats[0];
  const formattedResult = {
    total_clients: Number(result.total_clients),
    clients_with_providers: Number(result.clients_with_providers),
    oauth_only_users: Number(result.oauth_only_users),
    password_providers: Number(result.password_providers),
    google_providers: Number(result.google_providers),
  };

  console.log('--- Migration Verification Stats ---');
  console.log(JSON.stringify(formattedResult, null, 2));

  const total = Number(stats[0].total_clients);
  const withProviders = Number(stats[0].clients_with_providers);

  if (total === withProviders) {
    console.log('✅ PASS: All clients have at least one AuthProvider.');
  } else {
    console.log('❌ FAIL: Mismatch detected! Orphaned clients found.');
    console.log(`Difference: ${total - withProviders} clients missing providers.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
