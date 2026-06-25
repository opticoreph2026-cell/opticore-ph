import React from 'react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { PartnerLeadDetailClient } from './client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function PartnerLeadDetailPage(context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { id } = await context.params;
  const orgId = (session as any)?.organizationId as string | undefined;

  const lead = await db.energyLead.findUnique({
    where: { id },
    include: {
      utilityCompany: { select: { name: true, code: true } },
      assignedOrg: { select: { id: true, name: true } },
    },
  });

  if (!lead || (orgId && lead.assignedOrgId !== orgId)) {
    notFound();
  }

  return <PartnerLeadDetailClient lead={JSON.parse(JSON.stringify(lead))} userId={(session as any)?.sub} />;
}
