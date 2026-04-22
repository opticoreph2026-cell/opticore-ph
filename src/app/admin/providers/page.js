'use client';

import { useState, useEffect } from 'react';
import { Database, Plus, Trash2, Zap, Droplets, Info, Edit3, X, Save, Globe, ImageIcon, ExternalLink } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import Image from 'next/image';

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    type: 'electricity',
    region: '',
    baseRate: '',
    benchmarkAvg: '',
    logoUrl: '',
    website: '',
  });

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const res = await fetch('/api/dashboard/providers');
      const data = await res.json();
      setProviders(data.providers || []);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      type: p.type,
      region: p.region || '',
      baseRate: p.baseRate,
      benchmarkAvg: p.benchmarkAvg,
      logoUrl: p.logoUrl || '',
      website: p.website || '',
    });
    setShowAdd(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ name: '', type: 'electricity', region: '', baseRate: '', benchmarkAvg: '', logoUrl: '', website: '' });
    setShowAdd(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const payload = editingId ? { ...form, id: editingId } : form;

      const res = await fetch('/api/dashboard/providers', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        handleCancel();
        fetchProviders();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save provider');
      }
    } catch {
      alert('Error saving provider');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this provider?')) return;
    try {
      const res = await fetch(`/api/dashboard/providers?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchProviders();
    } catch {
      alert('Error deleting provider');
    }
  };

  const electricityProviders = providers.filter(p => p.type === 'electricity');
  const waterProviders = providers.filter(p => p.type === 'water');

  const ProviderCard = ({ p }) => (
    <div key={p.id} className="card group hover:border-brand-500/30 transition-all duration-300 border-white/5 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        {/* Logo or Icon fallback */}
        <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/[0.06] bg-surface-800 flex items-center justify-center shrink-0">
          {p.logoUrl ? (
            <Image
              src={p.logoUrl}
              alt={`${p.name} logo`}
              width={48}
              height={48}
              className="w-full h-full object-contain p-1"
              unoptimized
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${p.type === 'electricity' ? 'bg-amber-500/10' : 'bg-blue-500/10'}`}>
              {p.type === 'electricity' 
                ? <Zap className="w-5 h-5 text-amber-500" />
                : <Droplets className="w-5 h-5 text-blue-500" />}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
          {p.website && (
            <a
              href={p.website}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-text-muted hover:text-brand-400 hover:bg-brand-500/10 rounded-md transition-colors"
              title="Visit website"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={() => handleEdit(p)}
            className="p-1.5 text-text-muted hover:text-brand-400 hover:bg-brand-500/10 rounded-md transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(p.id)}
            className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="font-bold text-text-primary text-base truncate" title={p.name}>{p.name}</h3>
          {!p.logoUrl && (
            <span className="shrink-0 text-[9px] font-bold uppercase tracking-widest text-orange-400 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded-full">
              No Logo
            </span>
          )}
        </div>
        <p className="text-[11px] text-text-muted mb-4">{p.region || 'Nationwide'}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/[0.06]">
        <div>
          <p className="text-[9px] text-text-muted uppercase font-bold tracking-wider mb-1">Base Rate</p>
          <p className="text-base font-mono text-brand-400">
            ₱{p.baseRate?.toFixed(2)}
            <span className="text-[9px] ml-1 text-text-muted">/{p.type === 'electricity' ? 'kWh' : 'm³'}</span>
          </p>
        </div>
        <div>
          <p className="text-[9px] text-text-muted uppercase font-bold tracking-wider mb-1">AI Benchmark</p>
          <p className="text-base font-mono text-text-secondary">
            {p.benchmarkAvg}
            <span className="text-[9px] ml-1 text-text-muted">{p.type === 'electricity' ? 'kWh' : 'm³'}</span>
          </p>
        </div>
      </div>
    </div>
  );

  const ProviderList = ({ list, title, icon: Icon, colorClass }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h2 className="text-lg font-bold text-text-primary tracking-tight">{title}</h2>
        <span className="text-xs text-text-muted bg-white/5 px-2 py-0.5 rounded-full border border-white/10 uppercase font-mono">
          {list.length} Records
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-mono border ${
          list.filter(p => !p.logoUrl).length > 0 
            ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' 
            : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
        }`}>
          {list.filter(p => p.logoUrl).length}/{list.length} with logo
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map(p => <ProviderCard key={p.id} p={p} />)}
        {list.length === 0 && (
          <div className="col-span-full py-12 text-center card bg-surface-900/30 border-dashed border-white/5">
            <p className="text-sm text-text-muted">No {title.toLowerCase()} configured.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-up max-w-6xl pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Database className="w-6 h-6 text-brand-400" />
            Utility Configuration
          </h1>
          <p className="text-sm text-text-muted mt-1">Manage rates, providers, logos, and usage benchmarks</p>
        </div>
        <button
          onClick={() => showAdd ? handleCancel() : setShowAdd(true)}
          className={`btn-${showAdd ? 'ghost' : 'primary'} py-2 px-4 flex items-center gap-2 text-sm`}
        >
          {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAdd ? 'Cancel' : 'Add New Provider'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAdd && (
        <div className="card border-brand-500/20 bg-brand-500/5 animate-fade-up ring-1 ring-brand-500/20 shadow-xl shadow-brand-500/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-brand-400 uppercase tracking-widest">
              {editingId ? 'Edit Utility Provider' : 'Create New Provider'}
            </h2>
            {editingId && (
              <span className="text-[10px] text-text-muted font-mono">ID: {editingId}</span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Row 1: Core details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-[10px] font-bold text-text-muted uppercase mb-2">Provider Name *</label>
                <input
                  required
                  className="input-field py-2.5 text-sm"
                  placeholder="e.g. Manila Electric Company"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase mb-2">Utility Type *</label>
                <select
                  className="input-field py-2.5 text-sm"
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  disabled={!!editingId}
                >
                  <option value="electricity">⚡ Electricity</option>
                  <option value="water">💧 Water</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase mb-2">Coverage Region</label>
                <input
                  className="input-field py-2.5 text-sm"
                  placeholder="e.g. NCR, Region VII"
                  value={form.region}
                  onChange={e => setForm({ ...form, region: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-text-muted uppercase mb-2">Rate (₱/unit) *</label>
                  <input
                    required type="number" step="0.0001"
                    className="input-field py-2.5 text-sm"
                    placeholder="0.00"
                    value={form.baseRate}
                    onChange={e => setForm({ ...form, baseRate: e.target.value })}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-text-muted uppercase mb-2">AI Benchmark</label>
                  <input
                    required type="number" step="1"
                    className="input-field py-2.5 text-sm"
                    placeholder="200"
                    value={form.benchmarkAvg}
                    onChange={e => setForm({ ...form, benchmarkAvg: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Logo & Website */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 rounded-xl bg-surface-800/40 border border-white/[0.04]">
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase mb-2 flex items-center gap-1.5">
                  <ImageIcon className="w-3 h-3" /> Official Logo URL
                </label>
                <input
                  className="input-field py-2.5 text-sm"
                  placeholder="https://example.com/logo.png"
                  value={form.logoUrl}
                  onChange={e => setForm({ ...form, logoUrl: e.target.value })}
                />
                <p className="text-[10px] text-text-muted mt-1.5">
                  Paste the official logo image URL. PNG/SVG with transparent background recommended.
                </p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase mb-2 flex items-center gap-1.5">
                  <Globe className="w-3 h-3" /> Official Website URL
                </label>
                <input
                  className="input-field py-2.5 text-sm"
                  placeholder="https://meralco.com.ph"
                  value={form.website}
                  onChange={e => setForm({ ...form, website: e.target.value })}
                />
                <p className="text-[10px] text-text-muted mt-1.5">
                  Used for outbound links in the landing marquee and provider info cards.
                </p>
              </div>
              {/* Logo Preview */}
              {form.logoUrl && (
                <div className="lg:col-span-2 flex items-center gap-3 p-3 rounded-lg bg-surface-700/50 border border-white/[0.04]">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Preview:</p>
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
                    <img
                      src={form.logoUrl}
                      alt="Logo preview"
                      className="w-full h-full object-contain p-0.5"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                  <p className="text-xs text-text-muted truncate">{form.name || 'Provider Name'}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={handleCancel} className="btn-ghost py-2.5 px-5 text-sm">
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary py-2.5 px-6 flex items-center justify-center min-w-[120px] shadow-lg shadow-brand-500/20"
              >
                {submitting ? <Spinner size="sm" /> : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {editingId ? 'Update Provider' : 'Save Provider'}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-32 flex-col gap-4">
          <Spinner size="lg" />
          <p className="text-text-muted text-sm animate-pulse">Fetching utility datasets...</p>
        </div>
      ) : (
        <div className="space-y-16">
          <ProviderList 
            list={electricityProviders} 
            title="Electricity Providers" 
            icon={Zap} 
            colorClass="bg-amber-500/10 text-amber-500 border border-amber-500/20"
          />
          <ProviderList 
            list={waterProviders} 
            title="Water Providers" 
            icon={Droplets} 
            colorClass="bg-blue-500/10 text-blue-500 border border-blue-500/20"
          />
        </div>
      )}

      {!loading && providers.length === 0 && (
        <div className="py-32 text-center card bg-surface-900/50 border-dashed border-white/5">
          <Info className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-10" />
          <h3 className="text-text-secondary font-medium">Empty Dataset</h3>
          <p className="text-text-muted text-xs mt-2">No utility providers have been configured yet.</p>
        </div>
      )}
    </div>
  );
}
