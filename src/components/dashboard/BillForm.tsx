'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '../ui/Toast';
import { Spinner } from '../ui/Spinner';

interface Property {
  id: string;
  name: string;
  electricDU: string | null;
  waterUtility: string | null;
}

interface BillFormProps {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BillForm({ initialData, onSuccess, onCancel }: BillFormProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingProps, setFetchingProps] = useState(true);
  const { toast, error } = useToast();

  const [formData, setFormData] = useState({
    propertyId: '',
    utilityType: initialData?.utilityType || 'electric',
    billingPeriodStart: initialData?.billingPeriodStart || '',
    billingPeriodEnd: initialData?.billingPeriodEnd || '',
    dueDate: initialData?.dueDate || '',
    amountDue: initialData?.amountDue ? (initialData.amountDue / 100).toString() : '',
    consumption: initialData?.consumption?.toString() || '',
  });

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch('/api/dashboard/properties');
        if (res.ok) {
          const data = await res.json();
          setProperties(data.properties || []);
          if (data.properties?.length > 0) {
            setFormData(prev => ({ ...prev, propertyId: data.properties[0].id }));
          }
        }
      } catch (err) {
        console.error('Failed to load properties', err);
      } finally {
        setFetchingProps(false);
      }
    };
    fetchProperties();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        amountDue: Math.round(parseFloat(formData.amountDue) * 100), // Convert to centavos
        consumption: parseFloat(formData.consumption)
      };

      const res = await fetch('/api/dashboard/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save bill');
      }

      const data = await res.json();
      
      if (data.bill.ercVerified) {
        toast(`Bill saved and rate verified!`, 'success');
      } else {
        toast('Bill saved successfully.', 'success');
      }
      
      onSuccess();
    } catch (err: any) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProps) {
    return <div className="flex justify-center p-8"><Spinner /></div>;
  }

  if (properties.length === 0) {
    return (
      <div className="text-center p-8 bg-surface-900 border border-border-subtle rounded-xl">
        <h3 className="text-lg font-medium text-white mb-2">No Properties Found</h3>
        <p className="text-sm text-white/60 mb-4">You need to add a property before you can log a bill.</p>
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface-900 border border-border-subtle rounded-xl overflow-hidden">
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Property</label>
            <select
              name="propertyId"
              required
              value={formData.propertyId}
              onChange={handleChange}
              className="w-full bg-surface-800 border border-border-subtle rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-accent-cyan outline-none"
            >
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Utility Type</label>
            <select
              name="utilityType"
              required
              value={formData.utilityType}
              onChange={handleChange}
              className="w-full bg-surface-800 border border-border-subtle rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-accent-cyan outline-none"
            >
              <option value="electric">Electricity</option>
              <option value="water">Water</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Billing Start Date</label>
            <input
              type="date"
              name="billingPeriodStart"
              required
              value={formData.billingPeriodStart}
              onChange={handleChange}
              className="w-full bg-surface-800 border border-border-subtle rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-accent-cyan outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Billing End Date</label>
            <input
              type="date"
              name="billingPeriodEnd"
              required
              value={formData.billingPeriodEnd}
              onChange={handleChange}
              className="w-full bg-surface-800 border border-border-subtle rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-accent-cyan outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Consumption ({formData.utilityType === 'electric' ? 'kWh' : 'cu.m'})</label>
            <input
              type="number"
              step="0.01"
              name="consumption"
              required
              min="0"
              value={formData.consumption}
              onChange={handleChange}
              className="w-full bg-surface-800 border border-border-subtle rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-accent-cyan outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Amount Due (₱)</label>
            <input
              type="number"
              step="0.01"
              name="amountDue"
              required
              min="0"
              value={formData.amountDue}
              onChange={handleChange}
              className="w-full bg-surface-800 border border-border-subtle rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-accent-cyan outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Due Date (Optional)</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full bg-surface-800 border border-border-subtle rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-accent-cyan outline-none"
            />
          </div>
        </div>
      </div>
      
      <div className="p-6 bg-surface-800 border-t border-border-subtle flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-2.5 text-sm font-medium rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 text-sm font-medium rounded-lg bg-gradient-to-r from-accent-cyan to-accent-emerald text-white hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          {loading && <Spinner className="w-4 h-4" color="text-white" />}
          Save Bill
        </button>
      </div>
    </form>
  );
}
