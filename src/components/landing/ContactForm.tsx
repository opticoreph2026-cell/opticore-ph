'use client';

import React, { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Spinner } from '@/components/ui/Spinner';

const PROVINCES = ['Cebu', 'Bohol', 'Leyte', 'Other'] as const;

const PHONE_REGEX = /^(09\d{9}|\+639\d{9})$/;

interface FormErrors {
  fullName?: string;
  phone?: string;
  province?: string;
  monthlyBillPhp?: string;
}

export function ContactForm() {
  const t = useTranslations('contact.form');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const honeypotRef = useRef<HTMLInputElement>(null);
  const [submittedName, setSubmittedName] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    province: 'Cebu',
    city: '',
    addressLine: '',
    monthlyBillPhp: 5000,
    customerType: 'residential',
    notes: '',
  });

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (form.fullName.length < 2) newErrors.fullName = t('nameError');
    if (!PHONE_REGEX.test(form.phone)) newErrors.phone = t('phoneError');
    if (!form.province) newErrors.province = t('provinceError');
    if (!form.monthlyBillPhp || form.monthlyBillPhp < 1) newErrors.monthlyBillPhp = t('billError');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypotRef.current?.value) return;
    if (!validate()) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/energy/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          monthlyBillPhp: form.monthlyBillPhp * 100,
          source: 'website_contact',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('error'));

      setSubmittedName(form.fullName);
      setSuccess(true);
      setForm({
        fullName: '',
        phone: '',
        email: '',
        province: 'Cebu',
        city: '',
        addressLine: '',
        monthlyBillPhp: 5000,
        customerType: 'residential',
        notes: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-accent-emerald/30 bg-accent-emerald/10 p-8 text-center">
        <p className="text-accent-emerald font-medium text-lg">
          {t('success', { name: submittedName })}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input ref={honeypotRef} type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">{t('name')}</label>
          <input
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className={`w-full px-4 py-2.5 rounded-xl bg-surface-800 border ${errors.fullName ? 'border-accent-rose' : 'border-border-subtle'} text-white focus:outline-none focus:ring-2 focus:ring-accent-blue`}
          />
          {errors.fullName && <p className="text-xs text-accent-rose mt-1">{errors.fullName}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">{t('phone')}</label>
          <input
            required
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="09XX XXX XXXX"
            className={`w-full px-4 py-2.5 rounded-xl bg-surface-800 border ${errors.phone ? 'border-accent-rose' : 'border-border-subtle'} text-white focus:outline-none focus:ring-2 focus:ring-accent-blue`}
          />
          {errors.phone && <p className="text-xs text-accent-rose mt-1">{errors.phone}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">{t('email')}</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-800 border border-border-subtle text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">{t('province')}</label>
          <select
            value={form.province}
            onChange={(e) => setForm({ ...form, province: e.target.value })}
            className={`w-full px-4 py-2.5 rounded-xl bg-surface-800 border ${errors.province ? 'border-accent-rose' : 'border-border-subtle'} text-white focus:outline-none focus:ring-2 focus:ring-accent-blue`}
          >
            {PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {errors.province && <p className="text-xs text-accent-rose mt-1">{errors.province}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">{t('city')}</label>
          <input
            required
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-800 border border-border-subtle text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/80 mb-1.5">{t('address')}</label>
        <input
          value={form.addressLine}
          onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl bg-surface-800 border border-border-subtle text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/80 mb-1.5">{t('customerType')}</label>
        <select
          value={form.customerType}
          onChange={(e) => setForm({ ...form, customerType: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl bg-surface-800 border border-border-subtle text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
        >
          <option value="residential">{t('residential')}</option>
          <option value="small_commercial">{t('commercial')}</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/80 mb-1.5">{t('bill')}</label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1000"
            max="50000"
            step="500"
            value={form.monthlyBillPhp}
            onChange={(e) => setForm({ ...form, monthlyBillPhp: Number(e.target.value) })}
            className="flex-1 h-2 bg-surface-800 rounded-lg accent-accent-blue"
          />
          <span className="text-accent-blue font-bold min-w-[100px] text-right">
            ₱{form.monthlyBillPhp.toLocaleString()}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/80 mb-1.5">{t('message')}</label>
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl bg-surface-800 border border-border-subtle text-white focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none"
        />
      </div>

      {error && (
        <p className="text-sm text-accent-rose bg-accent-rose/10 border border-accent-rose/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-accent-blue text-white font-semibold hover:bg-accent-blue/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <Spinner className="w-5 h-5" /> : t('submit')}
      </button>
    </form>
  );
}
