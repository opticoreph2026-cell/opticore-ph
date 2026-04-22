import { Lock, Zap } from 'lucide-react';
import Link from 'next/link';

export default function ComingSoon({ title, description, moduleHeight = 'h-48' }) {
  return (
    <div className={`card flex flex-col items-center justify-center text-center p-8 relative overflow-hidden group border-brand-500/10 ${moduleHeight}`}>
      <div className="absolute inset-0 bg-surface-800/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
        <Link href="/pricing" className="btn-primary transform scale-95 group-hover:scale-100 transition-all">
          Upgrade to Pro
        </Link>
      </div>

      <div className="relative z-0 flex flex-col items-center">
        <div className="w-12 h-12 rounded-xl bg-surface-700 border border-white/5 flex items-center justify-center mb-4 relative">
          <Lock className="w-5 h-5 text-text-muted" />
          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-brand-500 border-2 border-surface-900 flex items-center justify-center">
            <Zap className="w-3 h-3 text-surface-900" />
          </div>
        </div>
        
        <h3 className="font-semibold text-text-primary mb-1">{title}</h3>
        <p className="text-sm text-text-muted max-w-[260px] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
