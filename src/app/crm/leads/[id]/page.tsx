import React from 'react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { canAccessCrm } from '@/lib/energy-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LeadDetailClient from './LeadDetailClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || !canAccessCrm(session as any)) {
    redirect('/login');
  }

  const { id } = await params;

  const [lead, activities, orgs] = await Promise.all([
    db.energyLead.findUnique({
      where: { id },
      include: {
        utilityCompany: true,
        assignedOrg: { select: { id: true, name: true } },
        customers: {
          select: { id: true, fullName: true, contactPhone: true, contactEmail: true, customerType: true, createdAt: true },
        },
      },
    }),
    db.activityLog.findMany({
      where: { relatedToType: 'lead', relatedToId: id },
      orderBy: { createdAt: 'desc' },
    }),
    db.energyOrganization.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  if (!lead) {
    redirect('/crm/leads');
  }

  return (
    <LeadDetailClient
      lead={JSON.parse(JSON.stringify(lead))}
      activities={JSON.parse(JSON.stringify(activities))}
      organizations={JSON.parse(JSON.stringify(orgs))}
      currentUserId={(session as any).id as string | null}
    />
  );
}
