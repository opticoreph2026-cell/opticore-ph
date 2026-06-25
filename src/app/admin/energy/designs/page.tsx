import React from 'react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { canAccessAdminEnergy } from '@/lib/energy-auth';
import { redirect } from 'next/navigation';
import { DesignAdminClient } from './client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AdminDesignsPage() {
  const session = await getSession();
  if (!session || !canAccessAdminEnergy(session as any)) redirect('/crm');

  const designs = await db.systemDesign.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      site: { select: { customer: { select: { fullName: true } } } },
      inverter: { select: { modelName: true } },
      battery: { select: { modelName: true, usableKwh: true } },
      _count: { select: { bomItems: true, quotations: true } },
    },
  });

  return <DesignAdminClient designs={JSON.parse(JSON.stringify(designs))} />;
}
