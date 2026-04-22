import { getCurrentUser } from '@/lib/auth';
import { getReadingsByClient, ensureDefaultProperty } from '@/lib/db';
import { redirect } from 'next/navigation';
import SolarEngine from '@/components/dashboard/SolarEngine';
import { Sun } from 'lucide-react';

export const metadata = { title: 'Solar Engine — OptiCore PH' };

export default async function SolarEnginePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  let avgKwh = 0;
  let effectiveRate = 12.5; // PHP average

  try {
    const activeProperty = await ensureDefaultProperty(user.sub);
    const readings = await getReadingsByClient(user.sub, activeProperty.id);
    
    if (readings.length > 0) {
      const recent = readings.slice(0, 6);
      const totalKwh = recent.reduce((sum, r) => sum + (r.kwhUsed || 0), 0);
      avgKwh = Math.round(totalKwh / recent.length);
      
      const latest = recent[0];
      if (latest.effectiveRate) {
        effectiveRate = latest.effectiveRate;
      } else if (latest.billAmountElectric && latest.kwhUsed) {
        effectiveRate = latest.billAmountElectric / latest.kwhUsed;
      }
    }
  } catch (e) {
    console.error('Failed to load readings for Solar Engine', e);
  }

  return (
    <div className="space-y-6 animate-fade-up max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary flex items-center gap-2 mb-1">
          <Sun className="w-6 h-6 text-brand-400" />
          Solar Feasibility Engine
        </h1>
        <p className="text-sm text-text-muted max-w-2xl leading-relaxed">
          Mathematically calculate your exact solar panel requirements, upfront installation cost, and ROI timeline based on your historical Philippine utility consumption.
        </p>
      </div>

      <SolarEngine initialAvgKwh={avgKwh} effectiveRate={effectiveRate} />
    </div>
  );
}
