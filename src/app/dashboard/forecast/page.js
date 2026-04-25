import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getClientById } from '@/lib/db';
import ForecastManager from '@/components/dashboard/ForecastManager';
import { Activity } from 'lucide-react';

export const metadata = {
  title: 'Predictive Forecast — OptiCore PH',
};

export default async function ForecastPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const client = await getClientById(user.sub);
  const plan = client?.planTier ?? 'starter';

  // Double check gating (though sidebar handles it visually)
  if (plan === 'starter' || plan === 'pro') {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6 animate-fade-up max-w-6xl">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary flex items-center gap-2">
          <Activity className="w-6 h-6 text-brand-400" />
          Predictive AI Forecasting
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Business-exclusive engine that predicts your future utility costs based on historical trends and seasonal patterns.
        </p>
      </div>

      <ForecastManager />
    </div>
  );
}
