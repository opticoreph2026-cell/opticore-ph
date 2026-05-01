import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import AppliancesManager from '@/components/dashboard/AppliancesManager';
import { Cpu } from 'lucide-react';

export const metadata = { title: 'My Appliances — OptiCore PH' };
export const dynamic = 'force-dynamic';

export default async function AppliancesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  let effectiveRate = 114250; // default 11.4250 rate units

  try {
    const activeProperty = await db.property.findFirst({
      where: { clientId: user.sub, isDefault: true }
    });
    
    if (activeProperty) {
      const latestReading = await db.utilityReading.findFirst({
        where: { clientId: user.sub, propertyId: activeProperty.id },
        orderBy: { readingDate: 'desc' }
      });
      
      if (latestReading) {
        if (latestReading.effectiveRate && latestReading.effectiveRate > 0) {
          effectiveRate = latestReading.effectiveRate;
        } else if (latestReading.kwhUsed > 0 && latestReading.billAmountElectric > 0) {
          // Convert centavos to rate units
          effectiveRate = Math.round((latestReading.billAmountElectric / 100 / latestReading.kwhUsed) * 10000);
        }
      }
    }
  } catch (err) {
    console.error('Failed to fetch effective rate for appliances:', err);
  }

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col pt-6 pb-20 lg:pb-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Cpu className="w-8 h-8 text-cyan-400" />
          Appliance <span className="text-cyan-400">Inventory</span>
        </h1>
        <p className="text-slate-400 font-bold mt-2">
          Manage your appliances to generate highly accurate cost estimates and personalized savings strategies.
        </p>
      </div>

      <div className="bg-surface-900 border border-white/5 rounded-3xl p-6 lg:p-8">
        <AppliancesManager effectiveRate={effectiveRate} />
      </div>
    </div>
  );
}
