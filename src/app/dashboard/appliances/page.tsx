'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Cpu, Plus, Trash2, Edit2 } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AppliancesPage() {
  const { data: profileData } = useSWR('/api/dashboard/profile', fetcher);
  const { data: appliancesData, mutate, isLoading } = useSWR('/api/dashboard/appliances', fetcher);
  const { toast, error } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const properties = profileData?.profile?.properties || [];
  const defaultPropertyId = properties.find((p: any) => p.isDefault)?.id || properties[0]?.id;

  const [form, setForm] = useState({
    propertyId: '',
    name: '',
    category: 'AC',
    wattage: '',
    hoursPerDay: '',
    quantity: '1'
  });

  useEffect(() => {
    if (defaultPropertyId && !form.propertyId) {
      setForm(prev => ({ ...prev, propertyId: defaultPropertyId }));
    }
  }, [defaultPropertyId, form.propertyId]);

  const appliances = appliancesData?.appliances || [];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        propertyId: form.propertyId,
        name: form.name,
        category: form.category,
        wattage: parseInt(form.wattage),
        hoursPerDay: parseFloat(form.hoursPerDay),
        quantity: parseInt(form.quantity)
      };

      const res = await fetch('/api/dashboard/appliances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to save appliance');
      
      toast('Appliance saved successfully', 'success');
      mutate();
      setIsFormOpen(false);
      setForm(prev => ({ ...prev, name: '', wattage: '', hoursPerDay: '', quantity: '1' }));
    } catch (err: any) {
      error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appliance?')) return;
    try {
      const res = await fetch(`/api/dashboard/appliances?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete appliance');
      toast('Appliance deleted', 'success');
      mutate();
    } catch (err: any) {
      error(err.message);
    }
  };

  // Estimated monthly cost at ~₱11.42 per kWh
  const calculateCost = (wattage: number, hours: number, qty: number) => {
    const kwhPerDay = (wattage * hours * qty) / 1000;
    return kwhPerDay * 30 * 11.42;
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col pt-6 pb-20 lg:pb-6 animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-3">
            <Cpu className="w-8 h-8 text-accent-cyan" />
            Appliance <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-emerald">Inventory</span>
          </h1>
          <p className="text-white/60 text-sm mt-2">
            Manage your appliances to generate highly accurate cost estimates and personalized savings strategies.
          </p>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-cyan to-accent-emerald hover:opacity-90 text-white font-medium rounded-xl transition-all shadow-lg self-start md:self-auto"
        >
          {isFormOpen ? 'Cancel' : <><Plus className="w-4 h-4" /> Add Appliance</>}
        </button>
      </div>

      {isFormOpen && (
        <SpotlightCard className="p-6 lg:p-8 mb-8 animate-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-medium text-white mb-6">Add New Appliance</h2>
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-xs font-semibold text-accent-cyan uppercase tracking-wider mb-2">Property</label>
                <select 
                  className="w-full bg-surface-1000 border border-border-subtle rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan transition-all"
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
                <label className="block text-xs font-semibold text-accent-cyan uppercase tracking-wider mb-2">Appliance Name</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-1000 border border-border-subtle rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan transition-all"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  placeholder="e.g. Master BR Aircon"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-accent-cyan uppercase tracking-wider mb-2">Category</label>
                <select 
                  className="w-full bg-surface-1000 border border-border-subtle rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan transition-all"
                  value={form.category}
                  onChange={(e) => setForm({...form, category: e.target.value})}
                  required
                >
                  <option value="AC">Air Conditioner</option>
                  <option value="Refrigerator">Refrigerator</option>
                  <option value="WashingMachine">Washing Machine</option>
                  <option value="Lighting">Lighting</option>
                  <option value="Entertainment">TV / Entertainment</option>
                  <option value="Computing">Computing</option>
                  <option value="Cooking">Cooking</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-accent-cyan uppercase tracking-wider mb-2">Wattage (W)</label>
                <input 
                  type="number" 
                  className="w-full bg-surface-1000 border border-border-subtle rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan transition-all"
                  value={form.wattage}
                  onChange={(e) => setForm({...form, wattage: e.target.value})}
                  placeholder="e.g. 1500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-accent-cyan uppercase tracking-wider mb-2">Hours per Day</label>
                <input 
                  type="number" 
                  step="0.5"
                  className="w-full bg-surface-1000 border border-border-subtle rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan transition-all"
                  value={form.hoursPerDay}
                  onChange={(e) => setForm({...form, hoursPerDay: e.target.value})}
                  placeholder="e.g. 8"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-accent-cyan uppercase tracking-wider mb-2">Quantity</label>
                <input 
                  type="number" 
                  min="1"
                  className="w-full bg-surface-1000 border border-border-subtle rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan transition-all"
                  value={form.quantity}
                  onChange={(e) => setForm({...form, quantity: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end border-t border-border-subtle pt-6">
              <button 
                type="submit" 
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-accent-cyan to-accent-emerald hover:opacity-90 text-white font-medium rounded-xl transition-all shadow-lg flex items-center gap-2"
              >
                {saving && <Spinner className="w-4 h-4" />}
                Save Appliance
              </button>
            </div>
          </form>
        </SpotlightCard>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Spinner className="w-8 h-8" />
        </div>
      ) : appliances.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appliances.map((app: any) => {
            const monthlyCost = calculateCost(app.wattage, app.hoursPerDay, app.quantity);
            return (
              <SpotlightCard key={app.id} className="p-6 relative group flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-surface-1000 border border-border-subtle rounded-xl flex items-center justify-center text-accent-cyan">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <button 
                    onClick={() => handleDelete(app.id)}
                    className="p-2 text-white/40 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="mb-6 flex-1">
                  <h3 className="text-lg font-medium text-white">{app.name}</h3>
                  <p className="text-sm text-white/40">{app.category} &bull; Qty: {app.quantity}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 border-t border-border-subtle pt-4 mt-auto">
                  <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Consumption</p>
                    <p className="text-sm font-medium text-white">{app.wattage}W &times; {app.hoursPerDay}h</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Est. Cost/Mo</p>
                    <p className="text-sm font-bold text-accent-emerald">₱{monthlyCost.toFixed(2)}</p>
                  </div>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      ) : (
        !isFormOpen && (
          <SpotlightCard className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-surface-1000 border border-border-subtle rounded-2xl flex items-center justify-center text-white/40 mb-4">
              <Cpu className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Build Your Energy Inventory</h3>
            <p className="text-white/60 text-sm max-w-md mx-auto mb-6">
              Log your appliances with their quantities and wattage to generate precise, AI-powered cost estimations.
            </p>
            <button 
              onClick={() => setIsFormOpen(true)}
              className="px-6 py-3 bg-surface-800 hover:bg-surface-800/80 text-white font-medium rounded-xl transition-all border border-border-subtle"
            >
              Add Your First Appliance
            </button>
          </SpotlightCard>
        )
      )}
    </div>
  );
}
