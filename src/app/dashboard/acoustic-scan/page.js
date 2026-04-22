import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AcousticAuditor from '@/components/dashboard/AcousticAuditor';
import { Activity } from 'lucide-react';

export const metadata = { title: 'Acoustic Auditor — OptiCore PH' };

export default async function AcousticScanPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <div className="space-y-6 animate-fade-up max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary flex items-center gap-2">
          <Activity className="w-6 h-6 text-brand-400" />
          Acoustic Appliance Auditor
          <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-md">
            BETA
          </span>
        </h1>
        <p className="text-sm text-text-muted mt-1 leading-relaxed">
          Record the sound of your humming air conditioner or refrigerator. OptiCore AI will use Fast Fourier Transform (FFT) equivalent frequency parsing to detect failing capacitors or struggling compressors before they break, saving you thousands of pesos in invisible phantom loads.
        </p>
      </div>

      <AcousticAuditor />
    </div>
  );
}
