import React from 'react';
import { db } from '@/lib/db';
import { UtilityTable } from '@/components/admin/UtilityTable';

export const dynamic = 'force-dynamic';

export default async function AdminUtilityRatesPage() {
  const utilities = await db.energyUtilityCompany.findMany({
    orderBy: { name: 'asc' },
    include: {
      rateSchedules: {
        orderBy: { effectiveDate: 'desc' },
        take: 1,
      },
    },
  });

  return <UtilityTable initialUtilities={utilities as any} />;
}
