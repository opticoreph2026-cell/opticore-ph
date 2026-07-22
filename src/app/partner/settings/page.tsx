import React from 'react';
import { Settings, Shield } from 'lucide-react';
import { ChangePasswordForm } from '@/components/ui/ChangePasswordForm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default function PartnerSettingsPage() {
  return (
    <div className="max-w-lg mx-auto space-y-8 py-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-accent-cyan" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground-950">Settings</h1>
          <p className="text-sm text-foreground-950/40">Manage your account security</p>
        </div>
      </div>

      <div className="bg-background-100/60 backdrop-blur-sm border border-foreground-950/10 rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border-subtle">
          <Shield className="w-5 h-5 text-accent-emerald" />
          <h2 className="text-base font-semibold text-foreground-950">Change Password</h2>
        </div>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
