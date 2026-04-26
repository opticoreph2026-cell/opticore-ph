import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getReadingsByClient, ensureDefaultProperty } from '@/lib/db';
import ROISimulator from '@/components/dashboard/ROISimulator';
import PlanGate from '@/components/dashboard/PlanGate';

export default async function ROISimulatorPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const clientPlan = user.plan || 'starter';

  // Fetch latest reading to get the effective rate
  const activeProperty = await ensureDefaultProperty(user.sub);
  const readings = await getReadingsByClient(user.sub, activeProperty.id);
  const latestReading = readings?.[0];

  // Compute effective rate from latest reading if available
  let effectiveRate = 0;
  if (latestReading) {
    if (latestReading.effectiveRate) {
      effectiveRate = latestReading.effectiveRate;
    } else if (latestReading.kwhUsed > 0 && latestReading.billAmountElectric > 0) {
      effectiveRate = latestReading.billAmountElectric / latestReading.kwhUsed;
    }
  }

  return (
    <PlanGate userPlan={clientPlan} requiredPlan="pro">
      <div className="space-y-6 animate-fade-up max-w-4xl">
        <div>
          <p className="section-label mb-1">Tools</p>
          <h1 className="text-2xl font-bold text-white">ROI Simulator</h1>
          <p className="text-sm text-white/40 mt-1">
            Calculate payback period and monthly savings for appliance upgrades.
          </p>
        </div>
        <ROISimulator effectiveRate={effectiveRate} />
      </div>
    </PlanGate>
  );
}
