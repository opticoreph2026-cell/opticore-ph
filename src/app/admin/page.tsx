import React from 'react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { AdminStats } from '@/components/dashboard/AdminStats';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  const [totalClients, totalLeads, totalProjects, totalInventory] = await Promise.all([
    db.client.count(),
    db.energyLead.count(),
    db.energyProject.count(),
    db.inventoryUnit.count(),
  ]);

  const recentLeads = await db.energyLead.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { id: true, fullName: true, status: true, customerType: true, createdAt: true },
  });

  const serializedLeads = recentLeads.map((l: { id: string; fullName: string; status: string; customerType: string; createdAt: Date }) => ({
    ...l,
    createdAt: l.createdAt.toISOString(),
  }));

  return (
    <AdminStats
      initialData={{
        totalClients,
        totalLeads,
        activeProjects: totalProjects,
        totalInventory,
        recentLeads: serializedLeads,
      }}
    />
  );
}
