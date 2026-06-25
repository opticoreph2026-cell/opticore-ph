import React from 'react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { canAccessAdminEnergy } from '@/lib/energy-auth';
import { redirect } from 'next/navigation';
import { CustomerAdminClient } from './client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const session = await getSession();
  if (!session || !canAccessAdminEnergy(session as any)) redirect('/crm');

  const customers = await db.energyCustomer.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      lead: { select: { fullName: true, status: true } },
      sites: { select: { id: true, address: true } },
      _count: { select: { quotations: true } },
    },
  });

  return <CustomerAdminClient customers={JSON.parse(JSON.stringify(customers))} />;
}
