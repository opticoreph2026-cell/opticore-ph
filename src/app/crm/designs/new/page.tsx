'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewDesignWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    leadId: '',
    monthlyBill: 10000,
    roofType: 'G.I. Sheet',
    averageMonthlyConsumption: 800, // kWh
  });

  const [designResult, setDesignResult] = useState<any>(null);

  const handleNext = () => setStep((s) => Math.min(s + 1, 5));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const handleCalculate = async () => {
    setLoading(true);
    try {
      // For now, call the API route to compute the design
      const res = await fetch('/api/energy/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: formData.leadId,
          averageMonthlyConsumption: formData.averageMonthlyConsumption,
        }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setDesignResult(data.data);
        handleNext();
      } else {
        alert(data.error || 'Failed to calculate design');
      }
    } catch (err) {
      console.error(err);
      alert('Error calculating design');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">System Design Wizard</h1>
        <div className="text-sm font-medium text-gray-500">Step {step} of 5</div>
      </div>

      <div className="bg-[#16161D] border border-white/5 rounded-2xl p-8">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Step 1: Load Profile</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Select Lead</label>
              <select 
                value={formData.leadId}
                onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                className="w-full bg-[#08080B] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#F5A524]"
              >
                <option value="">-- Select Lead --</option>
                <option value="test-lead-id">Test Lead (Mock)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Average Monthly Consumption (kWh)</label>
              <input 
                type="number" 
                value={formData.averageMonthlyConsumption}
                onChange={(e) => setFormData({ ...formData, averageMonthlyConsumption: Number(e.target.value) })}
                className="w-full bg-[#08080B] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#F5A524]"
              />
            </div>
            
            <div className="flex justify-end pt-6">
              <button 
                onClick={handleCalculate}
                disabled={loading}
                className="px-6 py-3 bg-[#F5A524] text-[#08080B] font-bold rounded-lg hover:bg-[#e0961f] transition-colors disabled:opacity-50"
              >
                {loading ? 'Calculating...' : 'Next: Component Selection'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Step 2: Component Selection</h2>
            <div className="p-4 bg-[#08080B] border border-white/5 rounded-lg space-y-3">
              <p className="text-gray-400"><span className="text-white font-medium">Inverter:</span> {designResult?.inverterModel}</p>
              <p className="text-gray-400"><span className="text-white font-medium">Battery:</span> {designResult?.batteryCapacityKwh} kWh</p>
              <p className="text-gray-400"><span className="text-white font-medium">Panels:</span> {designResult?.numberOfPanels} panels</p>
            </div>
            
            <div className="flex justify-between pt-6">
              <button onClick={handlePrev} className="px-6 py-3 bg-white/5 text-white font-medium rounded-lg hover:bg-white/10 transition-colors">Back</button>
              <button onClick={handleNext} className="px-6 py-3 bg-[#F5A524] text-[#08080B] font-bold rounded-lg hover:bg-[#e0961f] transition-colors">Next: ROI Engine</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Step 3: ROI Engine</h2>
            <p className="text-gray-400 mb-6">Dual-Rate Financial Model configuration goes here.</p>
            
            <div className="flex justify-between pt-6">
              <button onClick={handlePrev} className="px-6 py-3 bg-white/5 text-white font-medium rounded-lg hover:bg-white/10 transition-colors">Back</button>
              <button onClick={handleNext} className="px-6 py-3 bg-[#F5A524] text-[#08080B] font-bold rounded-lg hover:bg-[#e0961f] transition-colors">Next: Pricing</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Step 4: System Pricing</h2>
            <p className="text-gray-400 mb-6">P&L, BOQ, and margins adjustment.</p>
            
            <div className="flex justify-between pt-6">
              <button onClick={handlePrev} className="px-6 py-3 bg-white/5 text-white font-medium rounded-lg hover:bg-white/10 transition-colors">Back</button>
              <button onClick={handleNext} className="px-6 py-3 bg-[#F5A524] text-[#08080B] font-bold rounded-lg hover:bg-[#e0961f] transition-colors">Next: Generate Quote</button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 text-center py-12">
            <div className="w-20 h-20 bg-[#10B981]/20 text-[#10B981] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Design Complete</h2>
            <p className="text-gray-400 mb-8">The engineering design and financial model are ready.</p>
            
            <div className="flex justify-center gap-4">
              <button onClick={handlePrev} className="px-6 py-3 bg-white/5 text-white font-medium rounded-lg hover:bg-white/10 transition-colors">Back</button>
              <button onClick={() => router.push('/crm/designs')} className="px-6 py-3 bg-[#10B981] text-[#08080B] font-bold rounded-lg hover:bg-[#0ea5e9] transition-colors">
                Save & View Quotation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
