'use client';

import React from 'react';
import { AdminTable, type Column, type FieldConfig } from '@/components/ui/AdminTable';

interface Project {
  id: string;
  organization: { name: string } | null;
  status: string;
  scheduledInstallDate: string | null;
  actualInstallDate: string | null;
  commissioningDate: string | null;
  milestones: { milestone: string; milestoneDate: string }[];
  createdAt: string;
}

export function ProjectAdminClient({ projects }: { projects: Project[] }) {
  const columns: Column<Project>[] = [
    { key: 'org', label: 'Partner', render: (p) => p.organization?.name || '—' },
    {
      key: 'status', label: 'Status',
      render: (p) => {
        const colors: Record<string, string> = {
          scheduled: 'bg-accent-amber/10 text-accent-amber',
          in_progress: 'bg-accent-cyan/10 text-accent-cyan',
          commissioned: 'bg-accent-emerald/10 text-accent-emerald',
          warranty_registered: 'bg-purple-400/10 text-purple-400',
          closed: 'bg-white/5 text-white/60',
        };
        return (
          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium capitalize ${colors[p.status] ?? 'bg-white/5 text-white/60'}`}>
            {p.status.replace(/_/g, ' ')}
          </span>
        );
      },
    },
    { key: 'scheduledInstallDate', label: 'Install Date', render: (p) => p.scheduledInstallDate ? new Date(p.scheduledInstallDate).toLocaleDateString() : '—' },
    { key: 'milestones', label: 'Milestones', render: (p) => p.milestones.length },
  ];

  const fields: FieldConfig[] = [
    {
      key: 'status', label: 'Status', type: 'select',
      options: [
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'commissioned', label: 'Commissioned' },
        { value: 'warranty_registered', label: 'Warranty Registered' },
        { value: 'closed', label: 'Closed' },
      ],
    },
    { key: 'scheduledInstallDate', label: 'Scheduled Install Date', type: 'date' },
  ];

  const handleSave = async (data: Partial<Project>, id?: string) => {
    if (!id) throw new Error('Cannot create projects from admin page');
    const res = await fetch(`/api/energy/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(typeof err.error === 'string' ? err.error : 'Failed to update');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/energy/projects/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete');
  };

  return (
    <AdminTable
      title="Projects"
      description="Manage installation projects"
      columns={columns}
      data={projects}
      editFields={fields}
      onSave={handleSave as any}
      onDelete={handleDelete}
      searchKeys={[]}
    />
  );
}
