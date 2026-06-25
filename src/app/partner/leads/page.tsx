import React from 'react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { PartnerLeadsClient } from './client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function PartnerLeadsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const orgId = (session as any)?.organizationId as string | undefined;
  if (!orgId) {
    return (
      <div className="py-12 text-center">
        <p className="text-white/60">No organization assigned. Contact OptiCore admin.</p>
      </div>
    );
  }

  const leads = await db.energyLead.findMany({
    where: { assignedOrgId: orgId },
    orderBy: { createdAt: 'desc' },
    include: {
      utilityCompany: { select: { name: true, code: true } },
    },
  });

  return <PartnerLeadsClient leads={JSON.parse(JSON.stringify(leads))} />;
}
