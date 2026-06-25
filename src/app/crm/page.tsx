import React from 'react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { CrmStats } from '@/components/dashboard/CrmStats';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function CrmDashboard() {
  const session = await getSession();
  const role = session?.role as string;
  const isOwner = role === 'opticore_owner';
  const name = (session as any)?.name || session?.email || 'Team';
  const firstName = String(name).split(' ')[0] ?? '';

  const [newLeads, qualified, quoteSent, activeProjects, commissioned] = await Promise.all([
    db.energyLead.count({ where: { status: 'new' } }),
    db.energyLead.count({ where: { status: 'qualified' } }),
    db.energyLead.count({ where: { status: 'quote_sent' } }),
    db.energyProject.count({ where: { status: { in: ['scheduled', 'in_progress'] } } }),
    db.energyProject.count({ where: { status: 'commissioned' } }),
  ]);

  const recentLeads = await db.energyLead.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, fullName: true, city: true, status: true, createdAt: true, customerType: true },
  });

  const serializedLeads = recentLeads.map((l: { id: string; fullName: string; city: string | null; status: string; createdAt: Date; customerType: string }) => ({
    ...l,
    createdAt: l.createdAt.toISOString(),
  }));

  return (
    <CrmStats
      initialData={{ newLeads, qualified, quoteSent, activeProjects, commissioned, recentLeads: serializedLeads }}
      firstName={firstName}
      isOwner={isOwner}
    />
  );
}
