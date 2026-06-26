'use client';

import React, { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Spinner } from '@/components/ui/Spinner';
import { PhilippineAddressSelect } from '@/components/ui/PhilippineAddressSelect';
import { roundMoney } from '@/lib/money';

const PHONE_REGEX = /^(09\d{9}|\+639\d{9})$/;

interface FormErrors {
  fullName?: string;
  phone?: string;
  province?: string;
  monthlyBillPhp?: string;
}

export function ContactForm() {
  const t = useTranslations('contact.form');
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const honeypotRef = useRef<HTMLInputElement>(null);
  const [submittedName, setSubmittedName] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  function getInitialForm() {
    const billParam = searchParams?.get('bill');
    const typeParam = searchParams?.get('type');

    return {
      fullName: '',
      phone: '',
      email: '',
      province: '',
      city: '',
      barangay: '',
      addressLine: '',
      monthlyBillPhp: billParam ? parseInt(billParam) : 5000,
      customerType: typeParam === 'commercial' ? 'small_commercial' : 'residential',
      notes: '',
    };
  }

  const [form, setForm] = useState(getInitialForm);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (form.fullName.length < 2) newErrors.fullName = t('nameError');
    if (!PHONE_REGEX.test(form.phone)) newErrors.phone = t('phoneError');
    if (!form.province) newErrors.province = t('provinceError');
    if (!form.monthlyBillPhp || form.monthlyBillPhp < 1) newErrors.monthlyBillPhp = t('billError');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddressChange = (data: { province: string; city: string; barangay: string }) => {
    setForm((prev) => ({ ...prev, ...data }));
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
          monthlyBill: roundMoney(form.monthlyBillPhp),
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
        province: '',
        city: '',
        barangay: '',
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
    <form onSubmit={handleSubmit} className="space-y-3">
      <input ref={honeypotRef} type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-white/80 mb-1">{t('name')}</label>
          <input
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className={`w-full px-3 py-1.5 rounded-lg bg-surface-800 border ${errors.fullName ? 'border-accent-rose' : 'border-border-subtle'} text-white focus:outline-none focus:ring-2 focus:ring-accent-blue`}
          />
          {errors.fullName && <p className="text-xs text-accent-rose mt-0.5">{errors.fullName}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-white/80 mb-1">{t('phone')}</label>
          <input
            required
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="09XX XXX XXXX"
            className={`w-full px-3 py-1.5 rounded-lg bg-surface-800 border ${errors.phone ? 'border-accent-rose' : 'border-border-subtle'} text-white focus:outline-none focus:ring-2 focus:ring-accent-blue`}
          />
          {errors.phone && <p className="text-xs text-accent-rose mt-0.5">{errors.phone}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-white/80 mb-1">{t('email')}</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full px-3 py-1.5 rounded-lg bg-surface-800 border border-border-subtle text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
        />
      </div>

      <PhilippineAddressSelect
        province={form.province}
        city={form.city}
        barangay={form.barangay}
        onChange={handleAddressChange}
        streetSlot={
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1">{t('street')}</label>
            <input
              value={form.addressLine}
              onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg bg-surface-800 border border-border-subtle text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
              placeholder="House/Street"
            />
          </div>
        }
      />
      {errors.province && <p className="text-xs text-accent-rose mt-0.5">{errors.province}</p>}

      <div>
        <label className="block text-xs font-medium text-white/80 mb-1">{t('customerType')}</label>
        <select
          value={form.customerType}
          onChange={(e) => setForm({ ...form, customerType: e.target.value })}
          className="w-full px-3 py-1.5 rounded-lg bg-surface-800 border border-border-subtle text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
        >
          <option value="residential">{t('residential')}</option>
          <option value="small_commercial">{t('commercial')}</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-white/80 mb-1">{t('bill')}</label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="1000"
            max="50000"
            step="500"
            value={form.monthlyBillPhp}
            onChange={(e) => setForm({ ...form, monthlyBillPhp: Number(e.target.value) })}
            className="flex-1 h-1.5 bg-surface-800 rounded-lg accent-accent-blue"
          />
          <span className="text-accent-blue font-semibold min-w-[90px] text-right text-sm">
            ₱{form.monthlyBillPhp.toLocaleString()}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-white/80 mb-1">{t('message')}</label>
        <textarea
          rows={2}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full px-3 py-1.5 rounded-lg bg-surface-800 border border-border-subtle text-white focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none"
        />
      </div>

      {error && (
        <p className="text-xs text-accent-rose bg-accent-rose/10 border border-accent-rose/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 rounded-lg bg-accent-blue text-white font-semibold hover:bg-accent-blue/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
      >
        {loading ? <Spinner className="w-4 h-4" /> : t('submit')}
      </button>
    </form>
  );
}
