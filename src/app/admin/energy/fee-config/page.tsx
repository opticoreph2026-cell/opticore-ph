import React from 'react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { canAccessAdminEnergy } from '@/lib/energy-auth';
import { redirect } from 'next/navigation';
import { FeeConfigClient } from './client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function FeeConfigPage() {
  const session = await getSession();
  if (!session || !canAccessAdminEnergy(session as any)) redirect('/crm');

  let config = await db.feeConfiguration.findFirst();
  if (!config) {
    config = await db.feeConfiguration.create({ data: {} });
  }

  return <FeeConfigClient config={JSON.parse(JSON.stringify(config))} />;
}
