import React from 'react';
import { db } from '@/lib/db';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { Bell, ShieldAlert, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { DismissButton } from '@/components/admin/DismissButton';

export const dynamic = 'force-dynamic';

export default async function AdminAlertsPage() {
  const notifications = await db.adminNotification.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const getIcon = (type: string) => {
    switch(type) {
      case 'SECURITY': return <ShieldAlert className="w-5 h-5 text-accent-rose" />;
      case 'SYSTEM': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'BILLING': return <CheckCircle2 className="w-5 h-5 text-accent-emerald" />;
      default: return <Info className="w-5 h-5 text-accent-cyan" />;
    }
  };

  const getBg = (type: string) => {
    switch(type) {
      case 'SECURITY': return 'bg-accent-rose/10 border-accent-rose/20';
      case 'SYSTEM': return 'bg-amber-500/10 border-amber-500/20';
      case 'BILLING': return 'bg-accent-emerald/10 border-accent-emerald/20';
      default: return 'bg-accent-cyan/10 border-accent-cyan/20';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground-950 tracking-tight flex items-center gap-3">
            <Bell className="w-8 h-8 text-amber-500" />
            Global Alerts
          </h1>
          <p className="text-foreground-950/60 mt-1">System notifications, security events, and platform telemetry.</p>
        </div>
      </div>

      <SpotlightCard className="p-6">
        <h2 className="text-xl font-medium text-foreground-950 mb-6">Recent Admin Notifications</h2>
        
        {notifications.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center border border-dashed border-border-subtle rounded-2xl">
            <Bell className="w-12 h-12 text-foreground-950/20 mb-4" />
            <h3 className="text-lg font-medium text-foreground-950 mb-2">All Clear</h3>
            <p className="text-sm text-foreground-950/60">There are no recent alerts or notifications.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif: any) => (
              <div key={notif.id} className={`p-4 rounded-xl border flex gap-4 ${notif.isRead ? 'bg-surface-1000 border-border-subtle opacity-70' : 'bg-surface-900 border-foreground-950/10'}`}>
                <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border ${getBg(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className={`text-sm font-medium ${notif.isRead ? 'text-foreground-950/80' : 'text-foreground-950'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-xs font-mono text-foreground-950/40 shrink-0">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground-950/60 mt-1">{notif.message}</p>
                </div>
                <div className="shrink-0 flex items-start">
                  <DismissButton id={notif.id} isRead={notif.isRead} />
                </div>
              </div>
            ))}
          </div>
        )}
      </SpotlightCard>
    </div>
  );
}
