import React from 'react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { PartnerStats } from '@/components/dashboard/PartnerStats';

export const runtime = 'nodejs';

export default async function PartnerDashboard() {
  const session = await getSession();
  const orgId = (session as any)?.organizationId as string | undefined;

  const projects = await db.energyProject.findMany({
    where: orgId ? { organizationId: orgId } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      contract: {
        select: {
          quotation: {
            select: { customer: { select: { fullName: true } } },
          },
        },
      },
      milestones: {
        select: { milestone: true, milestoneDate: true },
        orderBy: { milestoneDate: 'desc' },
        take: 3,
      },
    },
  });

  const serialized = projects.map((p: any) => ({
    ...p,
    scheduledInstallDate: p.scheduledInstallDate?.toISOString() ?? null,
    commissioningDate: p.commissioningDate?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    milestones: p.milestones.map((m: { milestone: string; milestoneDate: Date }) => ({ ...m, milestoneDate: m.milestoneDate.toISOString() })),
  }));

  const activeCount = serialized.filter((p: any) => ['scheduled', 'in_progress'].includes(p.status)).length;
  const completedCount = serialized.filter((p: any) => p.status === 'commissioned' || p.status === 'warranty_registered').length;
  const scheduledCount = serialized.filter((p: any) => p.status === 'scheduled').length;

  return (
    <PartnerStats
      initialData={{ activeCount, completedCount, scheduledCount, projects: serialized }}
    />
  );
}
