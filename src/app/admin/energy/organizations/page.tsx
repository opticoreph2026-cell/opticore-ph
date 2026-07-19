import React from 'react';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { canAccessAdminEnergy } from '@/lib/energy-auth';
import { redirect } from 'next/navigation';
import type { EnergyOrganization } from '@prisma/client';
import { InlineToggle } from '@/components/admin/InlineToggle';

export const runtime = 'nodejs';

export default async function AdminOrganizationsPage() {
  const user = await getCurrentUser();
  if (!user || !canAccessAdminEnergy(user)) {
    redirect('/crm');
  }

  const organizations = await db.energyOrganization.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground-950 mb-2">Organizations</h1>
          <p className="text-foreground-400">Manage installation partners and their teams.</p>
        </div>
      </div>

      <div className="bg-surface-800 border border-border-subtle rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-900 border-b border-border-subtle text-foreground-950/60">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle text-foreground-950/80">
            {organizations.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-foreground-950/40">
                  No organizations found.
                </td>
              </tr>
            ) : (
              organizations.map((org: EnergyOrganization) => (
                <tr key={org.id} className="hover:bg-foreground-950/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground-950">{org.name}</td>
                  <td className="px-6 py-4 capitalize">{org.type.replace(/_/g, ' ')}</td>
                  <td className="px-6 py-4">
                    <InlineToggle
                      id={org.id}
                      field="status"
                      currentValue={org.status === 'active'}
                      apiPath={`/api/admin/organizations/${org.id}`}
                      labelTrue="active"
                      labelFalse="inactive"
                      colorTrue="text-accent-emerald"
                      colorFalse="text-accent-rose"
                    />
                  </td>
                  <td className="px-6 py-4 text-foreground-950/60">
                    {org.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
