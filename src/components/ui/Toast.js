'use client';

import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';
import { useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => onClose(), 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    info: <AlertCircle className="w-5 h-5 text-brand-400" />,
  };

  const bgStyles = {
    success: 'bg-emerald-500/10 border-emerald-500/20',
    error: 'bg-red-500/10 border-red-500/20',
    info: 'bg-brand-500/10 border-brand-500/20',
  };

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-[100] animate-fade-up">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl ${bgStyles[type]}`}>
        {icons[type]}
        <p className="text-sm font-medium text-text-primary pr-4">{message}</p>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
