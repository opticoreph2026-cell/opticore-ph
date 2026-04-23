'use client';

import { useState } from 'react';
import { X, Loader, FileUp, Keyboard, ArrowLeft, TriangleAlert, Lock } from 'lucide-react';

/**
 * OptiCore PH - Reading Submission Modal
 * Supports AI Vision OCR (Gemini 2.5 Flash) and Manual Entry.
 * 
 * STRUCTURE:
 *   fixed overlay (overflow-y-auto)
 *     centering wrapper (min-h-full flex items-center)
 *       modal panel (max-w-lg)
 *         hidden file input
 *         header
 *         content body
 */
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

  // ── Manual Submit ──────────────────────────────────────────────────────────
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

  // ── Vision Scanner ─────────────────────────────────────────────────────────
  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setError('File is too large. Please upload an image or PDF under 4MB.');
      // Reset input so they can select the same file again if needed
      e.target.value = '';
      return;
    }

    setError('');
    setStep('processing');
    setStatusText('Scanning bill with Gemini 2.5 Flash...');

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
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
         throw new Error(`Server payload rejected (Status: ${res.status}). The PDF or image might be too complex or large.`);
      }

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || json.error || 'Scan failed');

      const data    = json.data;
      const isWater = data.type === 'WATER' || !!data.m3Used;

      if (isWater) {
        throw new Error('Water bill scanning is disabled to conserve AI credits. Please use Manual Entry for water readings.');
      }

      setFormData({
        ...formData,
        kwhUsed:            data.kwhUsed || '',
        billAmountElectric: data.totalAmount || '',
        m3Used:             '',
        billAmountWater:    '',
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

  // ── Reset / Back ───────────────────────────────────────────────────────────
  function handleBack() {
    setStep('choose');
    setError('');
    setFormData({
      readingDate:        new Date().toISOString().substring(0, 10),
      kwhUsed:            '',
      billAmountElectric: '',
      m3Used:             '',
      billAmountWater:    '',
      providerDetected:   '',
    });
  }

  const inputStyle = {
    background:  'rgba(255, 255, 255, 0.02)',
    border:      '1px solid rgba(255,255,255,0.05)',
    borderRadius: '16px',
  };
  const inputClass = 'w-full px-5 py-4 text-sm text-white placeholder-slate-600 outline-none transition-all duration-300 focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500/40 font-medium shadow-inner-glow-white';

  return (
    /* Level 1 — fixed overlay with scroll */
    <div className="fixed inset-0 z-[100] overflow-y-auto">

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-2xl animate-fade-in"
        onClick={() => !loading && onClose(false)}
      />

      {/* Level 2 — centering wrapper */}
      <div className="relative min-h-full flex items-center justify-center p-6 sm:p-12">

        {/* Level 3 — modal panel */}
        <div
          className="relative w-full max-w-xl rounded-[40px] shadow-glass-lg animate-fade-up overflow-hidden border border-white/10 bg-slate-900/95"
          style={{
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

          {/* Hidden file input */}
          <input
            id="bill-upload"
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* Header */}
          <div className="relative flex items-center justify-between px-10 py-8 border-b border-white/5 z-10">
            <div className="flex items-center gap-5">
              {step !== 'choose' && step !== 'processing' && (
                <button
                  onClick={handleBack}
                  className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all hover:bg-white/[0.08]"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 mb-1.5">
                  {step === 'choose' ? 'Utility Intelligence' : step === 'manual' ? 'Data Verification' : 'AI Neural Scan'}
                </p>
                <h2 className="text-display text-2xl font-bold text-white leading-tight">
                  {step === 'choose' ? 'Submit Reading' :
                   step === 'manual' ? 'Verify Metrics' :
                   'Processing Bill…'}
                </h2>
              </div>
            </div>
            <button
              onClick={() => !loading && onClose(false)}
              disabled={loading}
              className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all hover:bg-white/[0.08] disabled:opacity-20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="relative p-10 z-10">
            {error && (
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium mb-8 animate-shake">
                <TriangleAlert className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* ── Step: Choose method ── */}
            {step === 'choose' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-400 mb-8 leading-relaxed font-medium">
                  Select your preferred method for monthly reading verification. AI neural scanning is available for electricity bills.
                </p>

                {/* AI Scan option */}
                {appliances.length === 0 ? (
                  <div className="w-full flex items-center gap-6 p-8 rounded-3xl bg-white/[0.02] border border-white/5 opacity-40 grayscale">
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center shrink-0">
                      <Lock className="w-6 h-6 text-slate-500" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-300">Electricity Neural Scan <span className="text-xs uppercase tracking-widest text-slate-500 ml-2">(Locked)</span></h3>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        Populate your hardware registry to unlock AI verification.
                      </p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => document.getElementById('bill-upload').click()}
                    className="w-full flex items-center gap-6 p-8 rounded-3xl text-left group transition-all duration-500 hover:-translate-y-1 hover:shadow-glass-cyan bg-white/[0.03] border border-white/5 hover:border-cyan-500/30"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 shadow-inner-glow-white">
                      <FileUp className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">Neural Bill Scan</h3>
                        <span className="text-[9px] font-black tracking-[0.2em] bg-cyan-500 text-slate-950 px-2.5 py-1 rounded-full uppercase">Neural</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        Extract unbundled charges and detect consumption anomalies using Gemini Vision AI.
                      </p>
                    </div>
                  </button>
                )}

                {/* Manual Entry */}
                <button
                  onClick={() => setStep('manual')}
                  className="w-full flex items-center gap-6 p-8 rounded-3xl text-left group transition-all duration-500 hover:-translate-y-1 hover:shadow-glass-lg bg-white/[0.03] border border-white/5 hover:border-white/20"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center shrink-0">
                    <Keyboard className="w-6 h-6 text-slate-400 group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Manual Reporting</h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Optimized for water utility bills and manual hardware meter logs.
                    </p>
                  </div>
                </button>
              </div>
            )}

            {/* ── Step: Manual form ── */}
            {step === 'manual' && (
              <form onSubmit={handleManualSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-3">
                    Verification Period
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.readingDate}
                    onChange={e => setFormData({ ...formData, readingDate: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div className="p-8 rounded-[32px] space-y-5 bg-cyan-500/[0.02] border border-cyan-500/10 shadow-inner-glow-white">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" /> Electrical Payload
                  </p>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2.5">Consumption (kWh)</label>
                      <input type="number" step="0.1" placeholder="0.0" required
                        value={formData.kwhUsed}
                        onChange={e => setFormData({ ...formData, kwhUsed: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2.5">Gross Amount (₱)</label>
                      <input type="number" step="0.01" placeholder="0.00" required
                        value={formData.billAmountElectric}
                        onChange={e => setFormData({ ...formData, billAmountElectric: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-[32px] space-y-5 bg-blue-500/[0.02] border border-blue-500/10 shadow-inner-glow-white">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Water Resource
                  </p>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2.5">Volume (m³)</label>
                      <input type="number" step="0.1" placeholder="0.0"
                        value={formData.m3Used}
                        onChange={e => setFormData({ ...formData, m3Used: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2.5">Gross Amount (₱)</label>
                      <input type="number" step="0.01" placeholder="0.00"
                        value={formData.billAmountWater}
                        onChange={e => setFormData({ ...formData, billAmountWater: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full py-5 rounded-[24px] text-xs uppercase tracking-[0.3em]"
                >
                  Confirm & Sync Intelligence
                </button>
              </form>
            )}

            {/* ── Step: Processing ── */}
            {step === 'processing' && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-8 animate-fade-up">
                <div className="relative">
                  <div className="w-24 h-24 rounded-[32px] bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center relative z-10 shadow-inner-glow-white">
                    <Loader className="w-10 h-10 text-cyan-400 animate-spin" />
                  </div>
                  <div className="absolute inset-[-15px] rounded-[40px] border border-cyan-500/20 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-display text-2xl font-black text-white uppercase tracking-[0.2em]">Analyzing</h3>
                  <p className="text-xs text-cyan-400 font-bold tracking-[0.2em] mt-3 animate-pulse">{statusText}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

