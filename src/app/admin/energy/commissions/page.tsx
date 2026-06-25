import React from 'react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { canAccessAdminEnergy } from '@/lib/energy-auth';
import { redirect } from 'next/navigation';
import { CommissionAdminClient } from './client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AdminCommissionsPage() {
  const session = await getSession();
  if (!session || !canAccessAdminEnergy(session as any)) redirect('/crm');

  const [commissions, orgs] = await Promise.all([
    db.commissionRecord.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        organization: { select: { name: true } },
        project: { select: { id: true, status: true } },
      },
    }),
    db.energyOrganization.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ]);

  return (
    <CommissionAdminClient
      commissions={JSON.parse(JSON.stringify(commissions))}
      orgs={JSON.parse(JSON.stringify(orgs))}
    />
  );
}
