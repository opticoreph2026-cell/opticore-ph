'use client';

import { Download, Printer, Lock } from 'lucide-react';
import { useState } from 'react';

export default function ExportButtons({ plan }) {
  const isPremium = plan === 'pro' || plan === 'business';
  const [downloading, setDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCSV = async () => {
    setDownloading(true);
    try {
      const res = await fetch('/api/dashboard/export/csv');
      if (!res.ok) {
        if (res.status === 403) alert('Upgrade to Pro to download CSV.');
        else alert('Failed to download CSV');
        return;
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'opticore_export.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  if (!isPremium) {
    return (
      <div className="flex gap-2 isolate">
        <button className="btn-ghost text-xs opacity-50 cursor-not-allowed flex items-center gap-1.5" title="Pro Feature">
          <Lock className="w-3.5 h-3.5 text-text-muted" /> Print PDF
        </button>
        <button className="btn-ghost text-xs opacity-50 cursor-not-allowed flex items-center gap-1.5" title="Pro Feature">
          <Lock className="w-3.5 h-3.5 text-text-muted" /> Export CSV
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 isolate">
      <button 
        onClick={handlePrint}
        className="btn-ghost text-xs flex items-center gap-1.5 hover:text-brand-400 border border-white/5 hover:border-brand-500/30"
      >
        <Printer className="w-3.5 h-3.5" /> Print / Save PDF
      </button>
      <button 
        onClick={handleCSV}
        disabled={downloading}
        className="btn-ghost text-xs flex items-center gap-1.5 hover:text-emerald-400 border border-white/5 hover:border-emerald-500/30 disabled:opacity-50"
      >
        <Download className="w-3.5 h-3.5" /> {downloading ? 'Exporting...' : 'Export CSV'}
      </button>
    </div>
  );
}
