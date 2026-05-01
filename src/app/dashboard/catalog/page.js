import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ApplianceCatalogClient from '@/components/dashboard/ApplianceCatalogClient';
import { Database } from 'lucide-react';

export const metadata = { title: 'Master Hardware Catalog — OptiCore PH' };

export default async function CatalogPage() {
  const jwtUser = await getCurrentUser();
  if (!jwtUser) redirect('/login');

  if (process.env.FEATURE_APPLIANCE_CATALOG !== 'true') {
    redirect('/dashboard');
  }

  let catalog = [];
  try {
    catalog = await db.applianceCatalog.findMany({
      orderBy: [
        { category: 'asc' },
        { brand: 'asc' }
      ]
    });
  } catch (error) {
    console.error('[Catalog Page] Error fetching:', error);
  }

  return (
    <div className="space-y-6 animate-fade-up max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary flex items-center gap-2">
          <Database className="w-6 h-6 text-brand-400" />
          Master Hardware Catalog
        </h1>
        <p className="text-sm text-text-muted mt-1 max-w-2xl leading-relaxed">
          The centralized OptiCore PH database of verifiable Department of Energy registered appliances. Use this index to review energy ratings, typical wattages, and baseline pricing before registering a device to your property.
        </p>
      </div>

      <ApplianceCatalogClient initialCatalog={catalog} />
    </div>
  );
}
