'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, X, ServerCrash, Save, Calculator, AlertTriangle, Trash2, Search, Filter, Cpu, Zap, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ApplianceCard from './ApplianceCard';
import ApplianceSearch from './ApplianceSearch';
import Spinner from '@/components/ui/Spinner';
import SpotlightCard from '@/components/ui/SpotlightCard';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

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

  const filteredAppliances = useMemo(() => {
    return appliances.filter(a => {
      const matchesSearch = (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (a.brand || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || a.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [appliances, searchTerm, categoryFilter]);

  const stats = useMemo(() => {
    const totalLoad = appliances.reduce((sum, a) => sum + (Number(a.wattage || 0) * (a.quantity || 1)), 0);
    const totalKwh = appliances.reduce((sum, a) => {
      if (!a.wattage || !a.hoursPerDay) return sum;
      return sum + ((a.wattage * a.hoursPerDay * 30 * (a.quantity || 1)) / 1000);
    }, 0);
    return {
      totalLoad,
      estMonthlyCost: totalKwh * effectiveRate,
      count: appliances.length
    };
  }, [appliances, effectiveRate]);

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
    <div className="space-y-12">
      
      {!isFormOpen && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-xl shadow-cyan-500/5">
                <Calculator className="w-7 h-7 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-display text-2xl font-bold text-white tracking-tight">Inventory Profiling</h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Manage your property's appliance footprint</p>
              </div>
            </div>
            <button onClick={() => setIsFormOpen(true)} className="btn-primary min-w-[160px] group">
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" /> Add Asset
            </button>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <SpotlightCard className="p-6 bg-surface-1000/20 backdrop-blur-md border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Peak Load</p>
                  <p className="text-2xl font-black text-white tracking-tighter">{stats.totalLoad.toLocaleString()} W</p>
                </div>
              </div>
            </SpotlightCard>
            
            <SpotlightCard className="p-6 bg-surface-1000/20 backdrop-blur-md border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Est. Monthly Cost</p>
                  <p className="text-2xl font-black text-white tracking-tighter">₱{stats.estMonthlyCost.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-6 bg-surface-1000/20 backdrop-blur-md border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Assets</p>
                  <p className="text-2xl font-black text-white tracking-tighter">{stats.count} Devices</p>
                </div>
              </div>
            </SpotlightCard>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search appliances by name or brand..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative min-w-[200px]">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white appearance-none focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all cursor-pointer"
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="aircon">Air Conditioners</option>
                <option value="refrigerator">Refrigerators</option>
                <option value="washing_machine">Washing Machines</option>
                <option value="water_heater">Water Heaters</option>
                <option value="electric_fan">Electric Fans</option>
                <option value="tv">Televisions</option>
                <option value="rice_cooker">Rice Cookers</option>
                <option value="microwave">Microwaves</option>
                <option value="electric_stove">Electric Stoves</option>
                <option value="iron">Irons</option>
                <option value="water_dispenser">Water Dispensers</option>
                <option value="heater">Heaters</option>
                <option value="pump">Pumps</option>
                <option value="other">Others</option>
              </select>
            </div>
          </div>
        </>
      )}

      {isFormOpen && (
        <div className="bento-card p-8 md:p-10 flex flex-col relative group mb-12 animate-fade-up !overflow-visible shadow-glass-lg">
          <div className="flex items-center justify-between mb-10 pb-8 border-b border-white/[0.04]">
            <div className="flex flex-col gap-1.5">
              <h3 className="text-display text-2xl font-bold text-white flex items-center gap-3">
                <Plus className="w-6 h-6 text-cyan-400" />
                {isEditing ? 'Edit Appliance Profile' : 'New Appliance Profiling'}
              </h3>
              <p className="text-sm text-slate-500 font-medium">Fill in the technical details below to update your energy inventory.</p>
            </div>
            <button onClick={resetForm} className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>

          {!isEditing && (
             <div className="mb-12 !z-[100] relative bg-white/[0.02] p-8 rounded-3xl border border-white/5 shadow-inner-glow-amber">
               <label className="block text-[10px] uppercase font-black tracking-[0.25em] text-cyan-400 mb-5">Registry Intelligence (Auto-Fill)</label>
               <ApplianceSearch onSelect={handleSelectTemplate} />
             </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 relative z-0">
            {error && <p className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium">{error}</p>}
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <label htmlFor="applianceName" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Appliance Name / Nickname*</label>
                <input id="applianceName" name="name" required className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Master's Bedroom Aircon" />
              </div>
              <div>
                <label htmlFor="applianceQuantity" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Quantity (Units)*</label>
                <input 
                  id="applianceQuantity"
                  name="quantity"
                  required 
                  type="number" 
                  min="1" 
                  className="input-field !border-cyan-500/30 text-cyan-400 font-bold" 
                  value={form.quantity} 
                  onChange={e => setForm({...form, quantity: e.target.value})} 
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label htmlFor="category" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Category*</label>
                <select id="category" name="category" className="input-field" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
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
                <label htmlFor="brand" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Brand</label>
                <input id="brand" name="brand" className="input-field" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} placeholder="e.g. Samsung" />
              </div>
              <div>
                <label htmlFor="model" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Model</label>
                <input id="model" name="model" className="input-field" value={form.model} onChange={e => setForm({...form, model: e.target.value})} placeholder="e.g. RT38" />
              </div>
               <div>
                <label htmlFor="year" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Year</label>
                <input id="year" name="year" type="number" min="1900" className="input-field" value={form.year} onChange={e => setForm({...form, year: e.target.value})} placeholder="e.g. 2021" />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-6 pt-6 border-t border-white/[0.04]">
              <div>
                <label htmlFor="wattage" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Wattage (Per Unit)</label>
                <input id="wattage" name="wattage" type="number" min="0" className="input-field" value={form.wattage} onChange={e => setForm({...form, wattage: e.target.value})} placeholder="e.g. 750" />
              </div>
              <div>
                <label htmlFor="hoursPerDay" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Daily Usage (Hours)</label>
                <input id="hoursPerDay" name="hours_per_day" type="number" min="0" max="24" step="0.5" className="input-field" value={form.hours_per_day} onChange={e => setForm({...form, hours_per_day: e.target.value})} placeholder="e.g. 8" />
              </div>
               <div>
                <label htmlFor="energyRating" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Energy Rating</label>
                <select id="energyRating" name="energy_rating" className="input-field" value={form.energy_rating} onChange={e => setForm({...form, energy_rating: e.target.value})}>
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

            <div className="pt-8 flex justify-end gap-4 border-t border-white/[0.04]">
              <button type="button" onClick={resetForm} className="px-6 py-3 rounded-2xl font-bold text-sm text-slate-400 hover:text-white transition-all">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary min-w-[180px]">
                {saving ? 'Processing...' : <><Save className="w-4 h-4" /> {isEditing ? 'Update Profile' : 'Save Appliance'}</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {filteredAppliances.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAppliances.map(a => (
            <ApplianceCard
              key={a.id}
              appliance={a}
              onEdit={handleEdit}
              onDelete={handleDelete}
              rate={effectiveRate}
            />
          ))}
        </div>
      ) : (
        !isFormOpen && (
          <div className="bento-card py-24 text-center group cursor-pointer hover:bg-white/[0.01]" onClick={() => setIsFormOpen(true)}>
            <div className="w-20 h-20 rounded-[32px] bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto mb-8 text-slate-600 group-hover:text-cyan-400 group-hover:scale-110 transition-all duration-500">
              <Plus className="w-10 h-10" />
            </div>
            <h3 className="text-display text-2xl font-bold text-white mb-3">Build Your Energy Inventory</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-10 leading-relaxed font-medium">
              Log your appliances with their quantities and wattage to generate precise, AI-powered cost estimations.
            </p>
            <button className="btn-primary px-10">
             Add Your First Appliance
            </button>
          </div>
        )
      )}
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="absolute inset-0 bg-surface-1000/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bento-card p-8 bg-surface-950 border border-white/10 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-display text-2xl font-bold text-white mb-3">Confirm Deletion</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-8">
                Are you sure you want to remove this asset? This action will permanently delete the appliance profile and its associated data logs.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-6 py-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-slate-400 font-bold text-sm hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => confirmDelete(deleteConfirmId)}
                  className="flex-1 px-6 py-3.5 rounded-2xl bg-rose-500 text-white font-bold text-sm hover:bg-rose-400 transition-all shadow-xl shadow-rose-500/20"
                >
                  Delete Asset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
