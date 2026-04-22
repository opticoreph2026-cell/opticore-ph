import Link from 'next/link';
import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center px-4 text-center overflow-hidden relative">
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-50 z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-amber-radial pointer-events-none z-0" />
      <div className="relative z-10 animate-fade-up">
        <div className="w-20 h-20 rounded-3xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-8 shadow-amber-md">
          <ShieldAlert className="w-10 h-10 text-brand-400 animate-pulse-slow" />
        </div>
        <p className="text-[120px] font-black text-brand-500/10 mb-2 font-mono leading-none tracking-tighter">
          404
        </p>
        <h1 className="text-3xl font-semibold text-text-primary mb-4 drop-shadow-md">Lost in the grid</h1>
        <p className="text-text-secondary mb-10 max-w-sm mx-auto leading-relaxed">
          The page you're looking for was either phantom-loaded away or simply doesn't exist. Let's get you back to the data.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard" className="btn-primary w-full sm:w-auto px-8 py-3">
            <LayoutDashboard className="w-4 h-4 mr-2" /> Go to Dashboard
          </Link>
          <Link href="/" className="btn-ghost w-full sm:w-auto px-8 py-3">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
