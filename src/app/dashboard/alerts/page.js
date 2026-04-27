import AlertsFeed from '@/components/dashboard/AlertsFeed';
import { Bell } from 'lucide-react';

export default function AlertsPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="section-label mb-1 text-cyan-400 font-black">Intelligence</p>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Bell className="w-8 h-8 text-orange-400" />
            Alerts
          </h1>
          <p className="text-sm text-white/40 mt-1 max-w-lg">
            Real-time notifications about utility usage anomalies, ghost loads, and potential leaks detected by OptiCore Intelligence.
          </p>
        </div>
      </div>

      <AlertsFeed />
    </div>
  );
}
