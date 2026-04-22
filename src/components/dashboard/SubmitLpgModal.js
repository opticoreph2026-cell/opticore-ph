'use client';

import { useState } from 'react';
import { X, Loader, Flame, CheckCircle, TriangleAlert } from 'lucide-react';

/**
 * OptiCore PH - LPG Tank Replacement Modal
 * Captures Thermodynamics metadata for depletion prediction.
 */
export default function SubmitLpgModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    replacementDate: new Date().toISOString().substring(0, 10),
    tankSizeKg: 11,
    costPhp: '',
    brand: '',
    isEmpty: false
  });

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/dashboard/lpg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to submit LPG reading');
      }

      setSuccess(true);
      setTimeout(() => {
        setLoading(false);
        setSuccess(false);
        onClose(true);
      }, 1500);

    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  }

  const inputStyle = {
    background: 'rgba(12, 12, 18, 0.75)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
  };
  const inputClass = 'w-full px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all focus:ring-1 focus:ring-orange-500/50';

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-md animate-fade-in"
        onClick={() => !loading && onClose(false)}
      />

      {/* Wrapper */}
      <div className="relative min-h-full flex items-center justify-center p-4 py-8">
        {/* Panel */}
        <div
          className="relative w-full max-w-md rounded-2xl shadow-2xl animate-slide-up overflow-hidden"
          style={{
            background: 'rgba(16, 16, 24, 0.92)',
            backdropFilter: 'blur(32px)',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 32px 80px rgba(0,0,0,0.7)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(249, 115, 22, 0.15)', border: '1px solid rgba(249, 115, 22, 0.3)' }}>
                <Flame className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-500 mb-0.5">
                  Thermodynamics Engine
                </p>
                <h2 className="text-base font-bold text-white leading-none">
                  Log Tank Replacement
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

            {success ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-green-500/10 border border-green-500/20">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Tank Logged</h3>
                  <p className="text-sm text-white/50">Analyzing depletion timeline...</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-white/35 mb-2">
                    Replacement Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.replacementDate}
                    onChange={e => setFormData({ ...formData, replacementDate: e.target.value })}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-white/30 font-bold mb-1.5">Tank Size (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 11"
                      required
                      value={formData.tankSizeKg}
                      onChange={e => setFormData({ ...formData, tankSizeKg: e.target.value })}
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white/30 font-bold mb-1.5">Cost (₱)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 1100"
                      required
                      value={formData.costPhp}
                      onChange={e => setFormData({ ...formData, costPhp: e.target.value })}
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] text-white/35 font-bold mb-2">Brand (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Solane, Petronas"
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>

                <label className="mt-2 flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isEmpty}
                    onChange={e => setFormData({ ...formData, isEmpty: e.target.checked })}
                    className="w-4 h-4 rounded bg-black/50 border-white/20 text-orange-500 focus:ring-orange-500/50"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">Mark as Empty</p>
                    <p className="text-[10px] text-white/40 leading-snug">Check this if you are recording a past tank that is already fully depleted.</p>
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 flex items-center justify-center p-3 rounded-xl font-bold text-sm transition-all text-white disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    boxShadow: '0 4px 14px rgba(234, 88, 12, 0.4)',
                  }}
                >
                  {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Log Replacement'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
