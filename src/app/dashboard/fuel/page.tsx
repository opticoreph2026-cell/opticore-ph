'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { Flame, Plus, Trash2 } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function FuelTrackerPage() {
  const { data: profileData } = useSWR('/api/dashboard/profile', fetcher);
  const { data: fuelData, mutate, isLoading } = useSWR('/api/dashboard/fuel', fetcher);
  const { toast, error } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const properties = profileData?.profile?.properties || [];
  const defaultPropertyId = properties.find((p: any) => p.isDefault)?.id || properties[0]?.id;

  const [form, setForm] = useState({
    propertyId: '',
    fuelType: 'LPG',
    quantity: '',
    pricePerUnit: '',
    purpose: 'Cooking',
    logDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    if (defaultPropertyId && !form.propertyId) {
      setForm(prev => ({ ...prev, propertyId: defaultPropertyId }));
    }
  }, [defaultPropertyId, form.propertyId]);

  const fuelLogs = fuelData?.fuelLogs || [];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        quantity: Math.round(parseFloat(form.quantity) * 100), // convert to scaled int
        pricePerUnit: Math.round(parseFloat(form.pricePerUnit) * 100) // convert to centavos
      };

      const res = await fetch('/api/dashboard/fuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to save fuel log');
      
      toast('Fuel log saved successfully', 'success');
      mutate();
      setIsFormOpen(false);
      setForm(prev => ({ ...prev, quantity: '', pricePerUnit: '', notes: '' }));
    } catch (err: any) {
      error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col pt-6 pb-20 lg:pb-6 animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-3">
            <Flame className="w-8 h-8 text-accent-emerald" />
            Fuel <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-emerald to-accent-cyan">Tracker</span>
          </h1>
          <p className="text-white/60 text-sm mt-2">
            Log LPG, diesel, or gasoline expenses for your household or generators.
          </p>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-emerald to-accent-cyan hover:opacity-90 text-white font-medium rounded-xl transition-all shadow-lg self-start md:self-auto"
        >
          {isFormOpen ? 'Cancel' : <><Plus className="w-4 h-4" /> Log Fuel</>}
        </button>
      </div>

      {isFormOpen && (
        <SpotlightCard className="p-6 lg:p-8 mb-8 animate-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-medium text-white mb-6">Log New Fuel Purchase</h2>
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-xs font-semibold text-accent-emerald uppercase tracking-wider mb-2">Property</label>
                <select 
                  className="w-full bg-surface-1000 border border-border-subtle rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-emerald transition-all"
                  value={form.propertyId}
                  onChange={(e) => setForm({...form, propertyId: e.target.value})}
                  required
                >
                  {properties.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-accent-emerald uppercase tracking-wider mb-2">Fuel Type</label>
                <select 
                  className="w-full bg-surface-1000 border border-border-subtle rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-emerald transition-all"
                  value={form.fuelType}
                  onChange={(e) => setForm({...form, fuelType: e.target.value})}
                  required
                >
                  <option value="LPG">LPG (Cooking Gas)</option>
                  <option value="Diesel">Diesel (Generator)</option>
                  <option value="Gasoline">Gasoline (Generator)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-accent-emerald uppercase tracking-wider mb-2">Purpose</label>
                <select 
                  className="w-full bg-surface-1000 border border-border-subtle rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-emerald transition-all"
                  value={form.purpose}
                  onChange={(e) => setForm({...form, purpose: e.target.value})}
                  required
                >
                  <option value="Cooking">Cooking</option>
                  <option value="Generator">Generator Backup</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-accent-emerald uppercase tracking-wider mb-2">Quantity ({form.fuelType === 'LPG' ? 'kg' : 'Liters'})</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full bg-surface-1000 border border-border-subtle rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-emerald transition-all"
                  value={form.quantity}
                  onChange={(e) => setForm({...form, quantity: e.target.value})}
                  placeholder="e.g. 11"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-accent-emerald uppercase tracking-wider mb-2">Price per {form.fuelType === 'LPG' ? 'kg' : 'Liter'} (₱)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full bg-surface-1000 border border-border-subtle rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-emerald transition-all"
                  value={form.pricePerUnit}
                  onChange={(e) => setForm({...form, pricePerUnit: e.target.value})}
                  placeholder="e.g. 85.50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-accent-emerald uppercase tracking-wider mb-2">Purchase Date</label>
                <input 
                  type="date"
                  className="w-full bg-surface-1000 border border-border-subtle rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-emerald transition-all"
                  value={form.logDate}
                  onChange={(e) => setForm({...form, logDate: e.target.value})}
                  required
                />
              </div>
              <div className="lg:col-span-3">
                <label className="block text-xs font-semibold text-accent-emerald uppercase tracking-wider mb-2">Notes (Optional)</label>
                <input 
                  type="text"
                  className="w-full bg-surface-1000 border border-border-subtle rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-emerald transition-all"
                  value={form.notes}
                  onChange={(e) => setForm({...form, notes: e.target.value})}
                  placeholder="e.g. Bought from Petron"
                />
              </div>
            </div>
            <div className="flex justify-end border-t border-border-subtle pt-6">
              <button 
                type="submit" 
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-accent-emerald to-accent-cyan hover:opacity-90 text-white font-medium rounded-xl transition-all shadow-lg flex items-center gap-2"
              >
                {saving && <Spinner className="w-4 h-4" />}
                Save Fuel Log
              </button>
            </div>
          </form>
        </SpotlightCard>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Spinner className="w-8 h-8" />
        </div>
      ) : fuelLogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fuelLogs.map((log: any) => (
            <SpotlightCard key={log.id} className="p-6 relative group flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-surface-1000 border border-border-subtle rounded-xl flex items-center justify-center text-accent-emerald">
                  <Flame className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">₱{(log.totalCost / 100).toFixed(2)}</p>
                  <p className="text-xs text-white/40">{new Date(log.logDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="mb-6 flex-1">
                <h3 className="text-lg font-medium text-white">{log.fuelType}</h3>
                <p className="text-sm text-white/40">{log.purpose} {log.notes && `• ${log.notes}`}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 border-t border-border-subtle pt-4 mt-auto">
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Quantity</p>
                  <p className="text-sm font-medium text-white">{(log.quantity / 100).toFixed(2)} {log.fuelType === 'LPG' ? 'kg' : 'L'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Price/Unit</p>
                  <p className="text-sm font-bold text-accent-emerald">₱{(log.pricePerUnit / 100).toFixed(2)}</p>
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>
      ) : (
        !isFormOpen && (
          <SpotlightCard className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-surface-1000 border border-border-subtle rounded-2xl flex items-center justify-center text-white/40 mb-4">
              <Flame className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No Fuel Logs Yet</h3>
            <p className="text-white/60 text-sm max-w-md mx-auto mb-6">
              Keep track of your generator diesel, cooking gas (LPG), and more.
            </p>
            <button 
              onClick={() => setIsFormOpen(true)}
              className="px-6 py-3 bg-surface-800 hover:bg-surface-800/80 text-white font-medium rounded-xl transition-all border border-border-subtle"
            >
              Log First Purchase
            </button>
          </SpotlightCard>
        )
      )}
    </div>
  );
}
