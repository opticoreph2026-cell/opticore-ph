'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    utilityCompanyId: 'MERALCO',
    averageBill: 5000,
    siteAddress: ''
  });

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
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
      console.error('[Onboarding]', err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080B] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent-cyan/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-between items-center mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-1 flex-1 mx-1 rounded-full ${i <= step ? 'bg-accent-cyan' : 'bg-white/10'}`} />
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
              <h2 className="text-2xl font-bold text-white font-display">Welcome to OptiCore</h2>
              <p className="text-gray-400 font-body">Let's set up your energy profile.</p>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Site Address</label>
                <input
                  type="text"
                  required
                  value={formData.siteAddress}
                  onChange={(e) => setFormData({ ...formData, siteAddress: e.target.value })}
                  placeholder="e.g. Metro Manila"
                  className="w-full px-4 py-3 bg-[#16161D] border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent-cyan"
                />
              </div>

              <button
                onClick={handleNext}
                disabled={!formData.siteAddress}
                className="w-full py-3 bg-white text-black font-semibold rounded-xl disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white font-display">Utility Provider</h2>
              <p className="text-gray-400 font-body">Who provides your electricity?</p>
              
              <div className="space-y-3">
                {['MERALCO', 'MORE_POWER', 'VECO', 'DLPC'].map((provider) => (
                  <button
                    key={provider}
                    onClick={() => setFormData({ ...formData, utilityCompanyId: provider })}
                    className={`w-full p-4 text-left rounded-xl border transition-all ${
                      formData.utilityCompanyId === provider 
                        ? 'bg-accent-cyan/10 border-accent-cyan text-accent-cyan' 
                        : 'bg-[#16161D] border-white/10 text-white hover:bg-white/5'
                    }`}
                  >
                    {provider.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <button onClick={handleBack} className="px-6 py-3 text-white bg-[#16161D] border border-white/10 rounded-xl">Back</button>
                <button onClick={handleNext} className="flex-1 py-3 bg-white text-black font-semibold rounded-xl">Continue</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white font-display">Energy Usage</h2>
              <p className="text-gray-400 font-body">What is your average monthly bill?</p>
              
              <div className="py-8">
                <div className="text-center text-4xl font-bold text-accent-emerald mb-6">
                  ₱{formData.averageBill.toLocaleString()}
                </div>
                <input 
                  type="range" 
                  min="1000" max="50000" step="500"
                  value={formData.averageBill}
                  onChange={(e) => setFormData({ ...formData, averageBill: Number(e.target.value) })}
                  className="w-full h-2 bg-[#16161D] rounded-lg appearance-none cursor-pointer accent-accent-emerald"
                />
              </div>

              <div className="flex gap-4">
                <button onClick={handleBack} disabled={loading} className="px-6 py-3 text-white bg-[#16161D] border border-white/10 rounded-xl disabled:opacity-50">Back</button>
                <button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-accent-cyan to-accent-emerald text-white font-semibold rounded-xl disabled:opacity-50"
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
