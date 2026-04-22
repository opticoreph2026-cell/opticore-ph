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
    background:  'rgba(12, 12, 18, 0.75)',
    border:      '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
  };
  const inputClass = 'w-full px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all focus:ring-1 focus:ring-brand-500/50';

  return (
    /* Level 1 — fixed overlay with scroll */
    <div className="fixed inset-0 z-[60] overflow-y-auto">

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-md animate-fade-in"
        onClick={() => !loading && onClose(false)}
      />

      {/* Level 2 — centering wrapper */}
      <div className="relative min-h-full flex items-center justify-center p-4 py-8">

        {/* Level 3 — modal panel */}
        <div
          className="relative w-full max-w-lg rounded-2xl shadow-2xl animate-slide-up overflow-hidden"
          style={{
            background:    'rgba(16, 16, 24, 0.92)',
            backdropFilter: 'blur(32px) saturate(180%)',
            WebkitBackdropFilter: 'blur(32px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 32px 80px rgba(0,0,0,0.7)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Hidden file input */}
          <input
            id="bill-upload"
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center gap-3">
              {step !== 'choose' && step !== 'processing' && (
                <button
                  onClick={handleBack}
                  className="text-white/40 hover:text-brand-400 transition-colors p-1 rounded-lg hover:bg-white/[0.05]"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-500 mb-0.5">
                  {step === 'choose' ? 'Bill Submission' : step === 'manual' ? 'Verify Data' : 'AI Engine'}
                </p>
                <h2 className="text-base font-bold text-white leading-none">
                  {step === 'choose' ? 'Submit Monthly Reading' :
                   step === 'manual' ? 'Confirm Extracted Values' :
                   'Analyzing Bill…'}
                </h2>
              </div>
            </div>
            <button
              onClick={() => !loading && onClose(false)}
              disabled={loading}
              className="text-white/30 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/[0.05] disabled:opacity-40"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {error && (
              <div
                className="flex items-start gap-3 p-3.5 rounded-xl text-sm text-red-300 mb-5"
                style={{ background: 'rgba(239,68,68,0.09)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
                <p>{error}</p>
              </div>
            )}

            {/* ── Step: Choose method ── */}
            {step === 'choose' && (
              <div className="space-y-3">
                <p className="text-sm text-white/40 mb-5 leading-relaxed">
                  Choose how to submit your monthly utility reading.
                </p>

                {/* AI Scan option */}
                {appliances.length === 0 ? (
                  <div
                    className="w-full flex items-center gap-4 p-5 rounded-xl text-left opacity-50 cursor-not-allowed"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <Lock className="w-5 h-5 text-white/30" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white/60">Electricity Bill Scan <span className="text-brand-500/60">(Locked)</span></h3>
                      <p className="text-[11px] text-white/30 mt-0.5 leading-relaxed">
                        Register at least one appliance in Inventory Profiling first.
                      </p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => document.getElementById('bill-upload').click()}
                    className="w-full flex items-center gap-4 p-5 rounded-xl text-left group transition-all duration-200"
                    style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.22)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.10)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,158,11,0.06)'}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}
                    >
                      <FileUp className="w-5 h-5 text-brand-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-white">Electricity Bill Scan</h3>
                        {user?.planTier === 'starter' && (
                          <span
                            className="text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full shrink-0"
                            style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.22)' }}
                          >
                            {Math.max(0, 3 - (user?.scanCount || 0))} FREE LEFT
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-white/40 mt-1 leading-relaxed">
                        Auto-extract kWh and bill totals from a photo or PDF of your electricity bill. Water must be entered manually.
                      </p>
                    </div>
                  </button>
                )}

                {/* Manual Entry */}
                <button
                  onClick={() => setStep('manual')}
                  className="w-full flex items-center gap-4 p-5 rounded-xl text-left group transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <Keyboard className="w-5 h-5 text-white/40" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Manual Entry</h3>
                    <p className="text-[11px] text-white/40 mt-1 leading-relaxed">
                      Type in your kWh usage and bill amount directly.
                    </p>
                  </div>
                </button>
              </div>
            )}

            {/* ── Step: Manual form ── */}
            {step === 'manual' && (
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-white/35 mb-2">
                    Reading Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.readingDate}
                    onChange={e => setFormData({ ...formData, readingDate: e.target.value })}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>

                <div
                  className="p-4 rounded-xl space-y-3"
                  style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.12)' }}
                >
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-500 flex items-center gap-2">
                    ⚡ Electric
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-white/30 font-bold mb-1.5">Usage (kWh)</label>
                      <input type="number" step="0.1" placeholder="e.g. 250" required
                        value={formData.kwhUsed}
                        onChange={e => setFormData({ ...formData, kwhUsed: e.target.value })}
                        className={inputClass} style={inputStyle}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/30 font-bold mb-1.5">Amount (₱)</label>
                      <input type="number" step="0.01" placeholder="e.g. 2800" required
                        value={formData.billAmountElectric}
                        onChange={e => setFormData({ ...formData, billAmountElectric: e.target.value })}
                        className={inputClass} style={inputStyle}
                      />
                    </div>
                  </div>
                </div>

                <div
                  className="p-4 rounded-xl space-y-3"
                  style={{ background: 'rgba(96,165,250,0.04)', border: '1px solid rgba(96,165,250,0.12)' }}
                >
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 flex items-center gap-2">
                    💧 Water
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-white/30 font-bold mb-1.5">Usage (m³)</label>
                      <input type="number" step="0.1" placeholder="e.g. 15"
                        value={formData.m3Used}
                        onChange={e => setFormData({ ...formData, m3Used: e.target.value })}
                        className={inputClass} style={inputStyle}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/30 font-bold mb-1.5">Amount (₱)</label>
                      <input type="number" step="0.01" placeholder="e.g. 800"
                        value={formData.billAmountWater}
                        onChange={e => setFormData({ ...formData, billAmountWater: e.target.value })}
                        className={inputClass} style={inputStyle}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary mt-2"
                  style={{ width: '100%' }}
                >
                  Generate AI Intelligence Report
                </button>
              </form>
            )}

            {/* ── Step: Processing ── */}
            {step === 'processing' && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-5">
                <div className="relative">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(245,158,11,0.10)', border: '2px solid rgba(245,158,11,0.25)' }}
                  >
                    <Loader className="w-9 h-9 text-brand-400 animate-spin" />
                  </div>
                  {/* Pulse ring */}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: '2px solid rgba(245,158,11,0.3)',
                      animation: 'pulse-ring 1.5s cubic-bezier(0.4,0,0.6,1) infinite',
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-widest">Analyzing</h3>
                  <p className="text-sm text-brand-400 font-mono animate-pulse mt-1">{statusText}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
