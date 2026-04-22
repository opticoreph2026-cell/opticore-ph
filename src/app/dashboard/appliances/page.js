import { getCurrentUser } from '@/lib/auth';
import { getReadingsByClient, ensureDefaultProperty } from '@/lib/db';
import { redirect } from 'next/navigation';
import AppliancesManager from '@/components/dashboard/AppliancesManager';
import { Cpu } from 'lucide-react';

export const metadata = { title: 'My Appliances — OptiCore PH' };

export default async function AppliancesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  // Fetch latest reading to derive the real ₱/kWh effective rate
  let effectiveRate = 11.5; // Cebu VECO baseline fallback
  try {
    const activeProperty = await ensureDefaultProperty(user.sub);
    const readings = await getReadingsByClient(user.sub, activeProperty.id);
    const latest = readings[0];
    if (latest) {
      if (latest.effectiveRate && latest.effectiveRate > 0) {
        effectiveRate = latest.effectiveRate;
      } else if (latest.kwhUsed > 0 && latest.billAmountElectric > 0) {
        effectiveRate = latest.billAmountElectric / latest.kwhUsed;
      }
    }
  } catch { /* degrade gracefully — use baseline rate */ }

  return (
    <div className="space-y-6 animate-fade-up max-w-6xl">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary flex items-center gap-2">
          <Cpu className="w-6 h-6 text-brand-400" />
          Appliance Profiling
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Add your appliances to help our AI generate highly accurate cost estimates and personalized savings strategies.
        </p>
      </div>

      <AppliancesManager effectiveRate={effectiveRate} />
    </div>
  );
}

