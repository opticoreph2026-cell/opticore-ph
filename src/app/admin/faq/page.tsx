import React from 'react';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { FaqManager } from './FaqManager';

export const dynamic = 'force-dynamic';

export default async function AdminFaqPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'opticore_owner') {
    redirect('/crm');
  }

  const entries = await db.faqEntry.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  const serialized = entries.map((e: { id: string; question: string; answer: string; locale: string; category: string | null; sortOrder: number; active: boolean; createdAt: Date; updatedAt: Date }) => ({
    ...e,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">FAQ Management</h1>
          <p className="text-gray-400">Manage frequently asked questions across locales.</p>
        </div>
      </div>
      <FaqManager initialEntries={serialized} />
    </div>
  );
}
