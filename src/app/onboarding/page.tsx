'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    utilityCompanyId: 'MERALCO',
    averageBill: 5000,
    siteAddress: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading' || status === 'unauthenticated') {
    return null;
  }

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/energy/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Onboarding failed');

      router.push('/customer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Onboarding failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent-cyan/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-between items-center mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-1 flex-1 mx-1 rounded-full ${i <= step ? 'bg-accent-cyan' : 'bg-foreground-950/10'}`} />
          ))}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bento-card"
        >
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground-950 font-display">Welcome to OptiCore</h2>
              <p className="text-foreground-400 font-body">Let's set up your energy profile.</p>
              
              <div>
                <label className="block text-sm font-medium text-foreground-950/80 mb-2">Site Address</label>
                <input
                  type="text"
                  required
                  value={formData.siteAddress}
                  onChange={(e) => setFormData({ ...formData, siteAddress: e.target.value })}
                  placeholder="e.g. Metro Manila"
                  className="w-full px-4 py-3 bg-background-800 border border-foreground-950/10 rounded-xl text-foreground-950 focus:outline-none focus:border-accent-cyan"
                />
              </div>

              <button
                onClick={handleNext}
                disabled={!formData.siteAddress}
                className="w-full py-3 bg-primary-500 text-foreground-950 font-semibold rounded-xl disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground-950 font-display">Utility Provider</h2>
              <p className="text-foreground-400 font-body">Who provides your electricity?</p>
              
              <div className="space-y-3">
                {['MERALCO', 'MORE_POWER', 'VECO', 'DLPC'].map((provider) => (
                  <button
                    key={provider}
                    onClick={() => setFormData({ ...formData, utilityCompanyId: provider })}
                    className={`w-full p-4 text-left rounded-xl border transition-all ${
                      formData.utilityCompanyId === provider 
                        ? 'bg-accent-cyan/10 border-accent-cyan text-accent-cyan' 
                        : 'bg-background-800 border-foreground-950/10 text-foreground-950 hover:bg-foreground-950/5'
                    }`}
                  >
                    {provider.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <button onClick={handleBack} className="px-6 py-3 text-foreground-950 bg-background-800 border border-foreground-950/10 rounded-xl">Back</button>
                <button onClick={handleNext} className="flex-1 py-3 bg-primary-500 text-foreground-950 font-semibold rounded-xl">Continue</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground-950 font-display">Energy Usage</h2>
              <p className="text-foreground-400 font-body">What is your average monthly bill?</p>
              
              <div className="py-8">
                <div className="text-center text-4xl font-bold text-accent-emerald mb-6">
                  ₱{formData.averageBill.toLocaleString()}
                </div>
                <input 
                  type="range" 
                  min="1000" max="50000" step="500"
                  value={formData.averageBill}
                  onChange={(e) => setFormData({ ...formData, averageBill: Number(e.target.value) })}
                  className="w-full h-2 bg-background-800 rounded-lg appearance-none cursor-pointer accent-emerald"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-accent-rose/10 border border-accent-rose/20 text-sm text-accent-rose">
                  {error}
                </div>
              )}
              <div className="flex gap-4">
                <button onClick={handleBack} disabled={loading} className="px-6 py-3 text-foreground-950 bg-background-800 border border-foreground-950/10 rounded-xl disabled:opacity-50">Back</button>
                <button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-accent-cyan to-accent-emerald text-foreground-950 font-semibold rounded-xl disabled:opacity-50"
                >
                  {loading ? 'Creating Profile...' : 'Complete Setup'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
