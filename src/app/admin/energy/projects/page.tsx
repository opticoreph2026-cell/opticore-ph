import React from 'react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { canAccessAdminEnergy } from '@/lib/energy-auth';
import { redirect } from 'next/navigation';
import { ProjectAdminClient } from './client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AdminProjectsPage() {
  const session = await getSession();
  if (!session || !canAccessAdminEnergy(session as any)) redirect('/crm');

  const projects = await db.energyProject.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      organization: { select: { name: true } },
      milestones: { select: { milestone: true, milestoneDate: true }, orderBy: { milestoneDate: 'desc' }, take: 3 },
    },
  });

  return <ProjectAdminClient projects={JSON.parse(JSON.stringify(projects))} />;
}
