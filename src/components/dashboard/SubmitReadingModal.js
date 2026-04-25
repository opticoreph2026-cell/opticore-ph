'use client';

import { useState } from 'react';
import { X, Loader, FileUp, Keyboard, ArrowLeft, TriangleAlert, Lock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SubmitReadingModal({ isOpen, onClose, user, appliances = [] }) {
  const [loading, setLoading]       = useState(false);
  const [step, setStep]             = useState('choose'); // 'choose' | 'manual' | 'processing'
  const [statusText, setStatusText] = useState('');
  const [error, setError]           = useState('');

  const [formData, setFormData] = useState({
    readingDate:        new Date().toISOString().substring(0, 10),
    kwhUsed:            '',
    billAmountElectric: '',
    m3Used:             '',
    billAmountWater:    '',
  });

  if (!isOpen) return null;

  async function handleManualSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setStep('processing');
    setStatusText('Routing structural mathematics...');

    try {
      const res = await fetch('/api/dashboard/readings', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ...formData,
          providerContext: user?.electricProvider || 'General',
          provider_detected: formData.providerDetected || null,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to submit reading');
      }

      setStatusText('Analysis complete! Saving report...');
      setTimeout(() => {
        setLoading(false);
        onClose(true);
      }, 1500);

    } catch (err) {
      setLoading(false);
      setError(err.message);
      setStep('manual');
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setError('File is too large. Max 4MB allowed.');
      e.target.value = '';
      return;
    }

    setError('');
    setStep('processing');
    setStatusText('Initiating Neural Scan...');

    const reader = new FileReader();
    reader.onloadend = async () => {
      await scanBill(reader.result);
    };
    reader.readAsDataURL(file);
  }

  async function scanBill(base64) {
    try {
      const res  = await fetch('/api/ai/scan', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ image: base64 }),
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || json.error || 'Scan failed');

      const data    = json.data;
      if (data.type === 'WATER' || !!data.m3Used) {
        throw new Error('Water bill scanning is restricted. Use Manual Entry.');
      }

      setFormData({
        ...formData,
        kwhUsed:            data.kwhUsed || '',
        billAmountElectric: data.totalAmount || '',
        readingDate:        data.billingDate || formData.readingDate,
        providerDetected:   data.providerName || '',
      });

      setStatusText(`Scan Complete: ${data.providerName || 'Detected'}`);
      setTimeout(() => setStep('manual'), 1200);

    } catch (err) {
      setError(err.message);
      setStep('choose');
    }
  }

  function handleBack() {
    setStep('choose');
    setError('');
  }

  const inputClass = 'w-full px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/5 text-sm text-white placeholder-slate-600 outline-none transition-all duration-300 focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500/40 font-bold';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-surface-1000/80 backdrop-blur-2xl"
        onClick={() => !loading && onClose(false)}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-xl rounded-[40px] bg-surface-950 border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient background decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        
        {/* Header */}
        <div className="relative px-10 pt-10 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {step !== 'choose' && step !== 'processing' && (
              <button onClick={handleBack} className="p-2 rounded-xl bg-white/[0.03] border border-white/5 text-slate-500 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 mb-1">
                {step === 'choose' ? 'Input Protocol' : 'Data Integrity'}
              </p>
              <h2 className="text-2xl font-black text-white">
                {step === 'choose' ? 'Submit Reading' : 'Verify Metrics'}
              </h2>
            </div>
          </div>
          <button onClick={() => onClose(false)} className="p-2 rounded-xl bg-white/[0.03] border border-white/5 text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-10 pb-12 pt-4">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-3"
              >
                <TriangleAlert className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}

            {step === 'choose' && (
              <motion.div 
                key="choose"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <button
                  onClick={() => document.getElementById('bill-upload').click()}
                  className="w-full p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-cyan-500/30 text-left transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 flex flex-col items-end gap-2">
                    <span className="px-2 py-1 rounded-md bg-cyan-500 text-[8px] font-black text-surface-1000 uppercase tracking-widest">Neural</span>
                    {user?.planTier === 'starter' && (
                      <span className="text-[7px] font-black text-slate-500 uppercase tracking-tighter">
                        {user.scanCount || 0}/1 Monthly Scans
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                      <FileUp className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white group-hover:text-cyan-400 transition-colors">Neural Bill Scan</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">Extract metrics using Gemini Vision AI</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setStep('manual')}
                  className="w-full p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-white/20 text-left transition-all group"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-500">
                      <Keyboard className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">Manual Log</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">Optimized for water & manual meters</p>
                    </div>
                  </div>
                </button>

                <input id="bill-upload" type="file" className="hidden" onChange={handleFileUpload} />
              </motion.div>
            )}

            {step === 'manual' && (
              <motion.form 
                key="manual"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleManualSubmit}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-full">
                    <label htmlFor="readingDate" className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-3 block">Reporting Period</label>
                    <input id="readingDate" name="readingDate" type="date" value={formData.readingDate} onChange={e => setFormData({ ...formData, readingDate: e.target.value })} className={inputClass} />
                  </div>
                  
                  <div>
                    <label htmlFor="kwhUsed" className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-3 block">Energy (kWh)</label>
                    <input id="kwhUsed" name="kwhUsed" type="number" step="0.1" required value={formData.kwhUsed} onChange={e => setFormData({ ...formData, kwhUsed: e.target.value })} className={inputClass} placeholder="0.0" />
                  </div>
                  <div>
                    <label htmlFor="billAmountElectric" className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-3 block">Gross Bill (₱)</label>
                    <input id="billAmountElectric" name="billAmountElectric" type="number" step="0.01" required value={formData.billAmountElectric} onChange={e => setFormData({ ...formData, billAmountElectric: e.target.value })} className={inputClass} placeholder="0.00" />
                  </div>

                  <div className="pt-4 col-span-full">
                    <div className="h-px bg-white/5 w-full mb-6" />
                    <div className="flex items-center justify-between mb-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 block">Water Consumption</label>
                       {user?.planTier === 'starter' && (
                         <span className="flex items-center gap-1 text-[8px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-400/10 px-2 py-1 rounded">
                           <Lock className="w-2 h-2" />
                           Audit Gated
                         </span>
                       )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="m3Used" className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-3 block">Volume (m³)</label>
                    <input id="m3Used" name="m3Used" type="number" step="0.01" value={formData.m3Used} onChange={e => setFormData({ ...formData, m3Used: e.target.value })} className={inputClass} placeholder="0.00" />
                  </div>
                  <div>
                    <label htmlFor="billAmountWater" className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-3 block">Water Bill (₱)</label>
                    <input id="billAmountWater" name="billAmountWater" type="number" step="0.01" value={formData.billAmountWater} onChange={e => setFormData({ ...formData, billAmountWater: e.target.value })} className={inputClass} placeholder="0.00" />
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full py-5 text-xs font-black uppercase tracking-[0.3em]">
                  Confirm & Synchronize
                </button>
              </motion.form>
            )}

            {step === 'processing' && (
              <motion.div 
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center relative z-10">
                    <Loader className="w-8 h-8 text-cyan-400 animate-spin" />
                  </div>
                  <div className="absolute inset-[-10px] border border-cyan-500/20 rounded-[35px] animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-widest">Processing</h3>
                  <p className="text-[10px] text-cyan-400 font-bold tracking-[0.2em] mt-2 animate-pulse">{statusText}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

