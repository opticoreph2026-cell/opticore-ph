import { getCurrentUser } from '@/lib/auth';
import { getClientById } from '@/lib/db';
import { redirect } from 'next/navigation';
import CertificateCard from '@/components/dashboard/CertificateCard';
import PlanGate from '@/components/dashboard/PlanGate';
import { Award } from 'lucide-react';

export const metadata = { title: 'Energy Certification — OptiCore PH' };

export default async function CertificationPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const client = await getClientById(user.sub);
  const clientPlan = client?.planTier || 'starter';

  return (
    <PlanGate userPlan={clientPlan} requiredPlan="pro">
      <div className="space-y-6 animate-fade-up max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary flex items-center gap-2 mb-1">
            <Award className="w-6 h-6 text-brand-400" />
            Energy Performance Certificate (EPC)
          </h1>
          <p className="text-sm text-text-muted max-w-2xl leading-relaxed">
            Generate an official, mathematically verified OptiCore Certificate. Prove to prospective tenants or buyers that your property is equipped with high-tier hardware and operates with a low energy footprint.
          </p>
        </div>

        <CertificateCard user={user} />
      </div>
    </PlanGate>
  );
}
