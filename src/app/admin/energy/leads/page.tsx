import React from 'react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { canAccessAdminEnergy } from '@/lib/energy-auth';
import { redirect } from 'next/navigation';
import { AdminPageClient } from './client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AdminLeadsPage() {
  const session = await getSession();
  if (!session || !canAccessAdminEnergy(session as any)) redirect('/crm');

  const [leads, orgs] = await Promise.all([
    db.energyLead.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        utilityCompany: { select: { name: true, code: true } },
        assignedOrg: { select: { id: true, name: true } },
      },
    }),
    db.energyOrganization.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ]);

  return <AdminPageClient leads={JSON.parse(JSON.stringify(leads))} orgs={JSON.parse(JSON.stringify(orgs))} />;
}
