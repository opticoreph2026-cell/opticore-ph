'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * PlanGate Component
 * Prevents access to premium features based on the user's plan tier.
 */
export default function PlanGate({ 
  userPlan = 'starter', 
  requiredPlan = 'pro', 
  children 
}) {
  const tiers = {
    'starter': 0,
    'pro': 1,
    'business': 2
  };

  const userLevel = tiers[userPlan?.toLowerCase()] ?? 0;
  const requiredLevel = tiers[requiredPlan?.toLowerCase()] ?? 1;

  const isLocked = userLevel < requiredLevel;

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-[60vh] flex items-center justify-center p-6 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-md w-full bento-card p-10 text-center border-brand-500/20 shadow-[0_32px_64px_rgba(34,211,238,0.1)]"
      >
        <div className="w-20 h-20 bg-brand-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 relative group">
          <div className="absolute inset-0 bg-brand-500/20 blur-xl group-hover:blur-2xl transition-all rounded-3xl" />
          {requiredPlan === 'business' ? (
            <Shield className="w-10 h-10 text-brand-400 relative z-10" />
          ) : (
            <Sparkles className="w-10 h-10 text-brand-400 relative z-10" />
          )}
          <div className="absolute -top-2 -right-2 bg-surface-950 p-1.5 rounded-full border border-white/10">
            <Lock className="w-4 h-4 text-amber-500" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
          Premium Module Locked
        </h2>
        
        <p className="text-text-muted text-sm mb-8 leading-relaxed">
          The <span className="text-brand-400 font-bold uppercase tracking-wider text-[10px]">
            {requiredPlan}
          </span> tier is required to access these high-fidelity engineering analytics and predictive models.
        </p>

        <div className="space-y-4">
          <Link 
            href="/pricing" 
            className="btn-primary w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(34,211,238,0.2)]"
          >
            Upgrade to {requiredPlan} <ArrowRight className="w-4 h-4" />
          </Link>
          
          <Link 
            href="/dashboard" 
            className="block text-[10px] font-black text-text-faint uppercase tracking-[0.2em] hover:text-white transition-colors"
          >
            Return to Command Center
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
