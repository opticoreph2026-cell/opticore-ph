'use client';

import { useState, useEffect } from 'react';
import { Plus, X, ServerCrash, Save, Calculator, AlertTriangle } from 'lucide-react';
import ApplianceCard from './ApplianceCard';
import ApplianceSearch from './ApplianceSearch';
import Spinner from '@/components/ui/Spinner';

export default function AppliancesManager({ effectiveRate = 11.5 }) {
  const [appliances, setAppliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  // Fix: replace native confirm() with React state-based confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  
  const [form, setForm] = useState({
    name: '', category: 'other', brand: '', model: '',
    year: '', wattage: '', hours_per_day: '', energy_rating: 'not-rated',
    notes: '', quantity: 1
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAppliances();
  }, []);

  const fetchAppliances = async () => {
    try {
      const res = await fetch('/api/dashboard/appliances');
      const data = await res.json();
      setAppliances(data.appliances || []);
    } catch {
      setError('Failed to load appliances.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '', category: 'other', brand: '', model: '',
      year: '', wattage: '', hours_per_day: '', energy_rating: 'not-rated',
      notes: '', quantity: 1
    });
    setIsEditing(null);
    setIsFormOpen(false);
    setError('');
  };

  const handleSelectTemplate = (template) => {
    setForm((prev) => ({
      ...prev,
      name: `${template.brand} ${template.category.replace('_', ' ')}`,
      brand: template.brand,
      model: template.model,
      category: template.category,
      wattage: template.typical_wattage,
      energy_rating: template.energy_rating || 'not-rated',
    }));
  };

  const handleEdit = (a) => {
    const f = a;
    setForm({
      name: f.name || '',
      category: f.category || 'other',
      brand: f.brand || '',
      model: f.model || '',
      year: f.year || '',
      wattage: f.wattage || '',
      hours_per_day: f.hoursPerDay || '',
      energy_rating: f.energyRating || 'not-rated',
      notes: f.notes || '',
      quantity: f.quantity || 1
    });
    setIsEditing(a.id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    // Fix: was confirm() — replaced with state-based confirmation (see UI below)
    setDeleteConfirmId(id);
  };

  const confirmDelete = async (id) => {
    try {
      const res = await fetch(`/api/dashboard/appliances?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAppliances(prev => prev.filter(a => a.id !== id));
      }
    } catch {
      // silently fail — toast will be added in Sprint 1
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = { ...form };
    if (!payload.name) payload.name = `${payload.brand} ${payload.model}`.trim() || 'My Appliance';

    try {
      const method = isEditing ? 'PUT' : 'POST';
      const body = isEditing ? { id: isEditing, ...payload } : payload;

      const res = await fetch('/api/dashboard/appliances', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save appliance.');
      } else {
        if (isEditing) {
          setAppliances(prev => prev.map(a => a.id === isEditing ? data.appliance : a));
        } else {
          setAppliances([data.appliance, ...appliances]);
        }
        resetForm();
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 flex justify-center"><Spinner /></div>;

  return (
    <div className="space-y-10">
      
      {!isFormOpen && (
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-brand-400" />
            <h2 className="text-lg font-semibold text-text-primary">Inventory Profiling</h2>
          </div>
          <button onClick={() => setIsFormOpen(true)} className="btn-primary text-xs px-4 py-2 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Appliance
          </button>
        </div>
      )}

      {isFormOpen && (
        <div className="bento-card p-6 md:p-8 flex flex-col relative group mb-10 animate-fade-up !overflow-visible" style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.05) inset, 0 16px 40px rgba(0,0,0,0.4), inset 0 0 40px rgba(245,158,11,0.02)' }}>

          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-brand-500/10 to-transparent"></div>
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/[0.04]">
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-text-primary text-xl flex items-center gap-2.5">
                <Plus className="w-5 h-5 text-brand-400" />
                {isEditing ? 'Edit Appliance Profile' : 'New Appliance Profiling'}
              </h3>
              <p className="text-xs text-text-muted">Fill in the technical details below to update your energy inventory.</p>
            </div>
            <button onClick={resetForm} className="p-2 rounded-xl hover:bg-white/10 text-text-muted hover:text-text-primary transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>

          
          {!isEditing && (
             <div className="mb-10 !z-[100] relative bg-white/[0.02] p-6 rounded-2xl border border-white/5">
               <label className="block text-[11px] uppercase font-black tracking-[0.2em] text-brand-500 mb-4">Registry Intelligence (Auto-Fill)</label>
               <ApplianceSearch onSelect={handleSelectTemplate} />
             </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 relative z-0">

            {error && <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-text-secondary mb-3">Appliance Name / Nickname*</label>
                <input required className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Master's Bedroom Aircon" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-3">Quantity (Units)*</label>
                <input 
                  required 
                  type="number" 
                  min="1" 
                  className="input-field border-brand-500/30 text-brand-400 font-bold" 
                  value={form.quantity} 
                  onChange={e => setForm({...form, quantity: e.target.value})} 
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-3">Category*</label>
                <select className="input-field py-3 text-sm" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  <option value="aircon">Air Conditioner</option>
                  <option value="refrigerator">Refrigerator</option>
                  <option value="washing_machine">Washing Machine</option>
                  <option value="water_heater">Water Heater</option>
                  <option value="electric_fan">Electric Fan</option>
                  <option value="tv">Television</option>
                  <option value="rice_cooker">Rice Cooker</option>
                  <option value="microwave">Microwave</option>
                  <option value="electric_stove">Electric Stove</option>
                  <option value="iron">Iron</option>
                  <option value="water_dispenser">Water Dispenser</option>
                  <option value="heater">Heater</option>
                  <option value="pump">Pump</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-3">Brand</label>
                <input className="input-field" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} placeholder="e.g. Samsung" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-3">Model</label>
                <input className="input-field" value={form.model} onChange={e => setForm({...form, model: e.target.value})} placeholder="e.g. RT38" />
              </div>
               <div>
                <label className="block text-xs font-semibold text-text-secondary mb-3">Year</label>
                <input type="number" min="1900" max={new Date().getFullYear() + 1} className="input-field" value={form.year} onChange={e => setForm({...form, year: e.target.value})} placeholder="e.g. 2021" />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 border-t border-white/[0.06] pt-4 mt-2">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-3">Wattage (Per Unit)</label>
                <input type="number" min="0" className="input-field" value={form.wattage} onChange={e => setForm({...form, wattage: e.target.value})} placeholder="e.g. 750" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Daily Usage (Hours)</label>
                <input type="number" min="0" max="24" step="0.5" className="input-field" value={form.hours_per_day} onChange={e => setForm({...form, hours_per_day: e.target.value})} placeholder="e.g. 8" />
              </div>
               <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Energy Rating</label>
                <select className="input-field py-3 text-sm" value={form.energy_rating} onChange={e => setForm({...form, energy_rating: e.target.value})}>
                  <option value="not-rated">Not Rated</option>
                  <option value="inverter">Inverter (High Efficiency)</option>
                  <option value="5-star">5 Star (Excellent)</option>
                  <option value="4-star">4 Star (Very Good)</option>
                  <option value="3-star">3 Star (Good)</option>
                  <option value="2-star">2 Star (Fair)</option>
                  <option value="1-star">1 Star (Poor)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-white/[0.04]">
              <button type="button" onClick={resetForm} className="btn-ghost text-xs px-5 py-2.5">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary text-xs px-8 py-2.5 flex items-center gap-2 shadow-lg shadow-brand-500/20">
                {saving ? <Spinner size="sm" /> : <><Save className="w-4 h-4" /> {isEditing ? 'Update Profile' : 'Save Appliance'}</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {appliances.length > 0 ? (
        <>
          {/* Inline delete confirmation — replaces native confirm() */}
          {deleteConfirmId && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-2 animate-fade-up">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-sm text-red-300">Are you sure you want to delete this appliance? This cannot be undone.</p>
              </div>
              <div className="flex gap-2 ml-4 shrink-0">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="btn-ghost text-xs px-3 py-1.5"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDelete(deleteConfirmId)}
                  className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/30 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {appliances.map(a => (
              <ApplianceCard
                key={a.id}
                appliance={a}
                onEdit={handleEdit}
                onDelete={handleDelete}
                rate={effectiveRate} /* Fix: was hardcoded rate={12} */
              />
            ))}
          </div>
        </>
      ) : (
        !isFormOpen && (
          <div className="bento-card relative overflow-hidden group text-center py-24" style={{ boxShadow: 'inset 0 0 40px rgba(245,158,11,0.01)' }}>
            <div className="absolute inset-0 bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center mx-auto mb-6 text-text-muted">
              <Plus className="w-8 h-8 opacity-20" />
            </div>
            <h3 className="text-text-primary font-semibold text-xl mb-2">Build Your Energy Inventory</h3>
            <p className="text-sm text-text-muted max-w-sm mx-auto mb-8 leading-relaxed">
              Log your appliances with their quantities and wattage to generate precise, AI-powered cost estimations.
            </p>
            <button onClick={() => setIsFormOpen(true)} className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2 mx-auto">
             <Plus className="w-5 h-5 shadow-lg" /> Add Your First Appliance
            </button>
          </div>
        )
      )}
    </div>
  );
}
