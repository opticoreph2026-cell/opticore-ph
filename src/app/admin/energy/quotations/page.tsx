import React from 'react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { canAccessAdminEnergy } from '@/lib/energy-auth';
import { redirect } from 'next/navigation';
import { QuotationAdminClient } from './client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AdminQuotationsPage() {
  const session = await getSession();
  if (!session || !canAccessAdminEnergy(session as any)) redirect('/crm');

  const quotations = await db.energyQuotation.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      customer: { select: { fullName: true } },
      design: { select: { pvArrayKwp: true, designPathway: true } },
      roiScenario: { select: { scenarioLabel: true } },
    },
  });

  return <QuotationAdminClient quotations={JSON.parse(JSON.stringify(quotations))} />;
}
