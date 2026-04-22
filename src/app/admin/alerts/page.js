import { listAllAlerts } from '@/lib/db';
import { Bell, TriangleAlert } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export const metadata = { title: 'Admin Alerts — OptiCore PH' };

export default async function AdminAlertsPage() {
  let alerts = [];
  try { alerts = await listAllAlerts(); } catch { /* ok */ }

  return (
    <div className="space-y-6 animate-fade-up max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary flex items-center gap-2">
          <Bell className="w-6 h-6 text-orange-400" /> All Alerts
        </h1>
        <p className="text-sm text-text-muted mt-1">
          {alerts.length} system-wide alerts across all clients.
        </p>
      </div>

      {alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((a) => {
            const sev = a.severity ?? 'info';
            return (
              <div
                key={a.id}
                className={`card flex items-start gap-4 ${
                  sev === 'critical' ? 'border-red-500/20 bg-red-500/5' :
                  sev === 'warning'  ? 'border-orange-500/20 bg-orange-500/5' :
                  'border-blue-500/20 bg-blue-500/5'
                }`}
              >
                <TriangleAlert className={`w-4 h-4 mt-0.5 shrink-0 ${
                  sev === 'critical' ? 'text-red-400' :
                  sev === 'warning'  ? 'text-orange-400' : 'text-blue-400'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-text-muted">
                      {String(a.clientId ?? '').slice(0, 8)}…
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {a.createdAt
                        ? format(new Date(a.createdAt), 'MMM d, yyyy')
                        : ''}
                    </span>
                    {a.isRead && (
                      <span className="text-[10px] text-text-muted bg-surface-700 px-1.5 py-0.5 rounded">read</span>
                    )}
                  </div>
                  <p className="text-sm text-text-primary font-medium">
                    {a.title ?? 'Usage Alert'}
                  </p>
                  <p className="text-sm text-text-secondary mt-0.5">
                    {a.message ?? ''}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card flex flex-col items-center py-16 gap-4">
          <Bell className="w-8 h-8 text-text-muted" />
          <p className="text-text-muted text-sm">No alerts in the system.</p>
        </div>
      )}
    </div>
  );
}
