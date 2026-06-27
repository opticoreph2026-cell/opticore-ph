'use client';

import { useState, useRef } from 'react';
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
      <div className="rounded-2xl border border-secondary-500/30 bg-secondary-500/10 p-8 text-center">
        <p className="text-secondary-500 font-medium text-lg">
          {t('success', { name: submittedName })}
        </p>
      </div>
    );
  }

  const fieldClass = (hasError?: boolean) =>
    `w-full px-3 py-1.5 rounded-lg bg-background-100/40 border ${
      hasError ? 'border-rose-500' : 'border-foreground-950/10'
    } text-foreground-950 focus:outline-none focus:ring-2 focus:ring-primary-500/50`;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input ref={honeypotRef} type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-foreground-700 mb-1">{t('name')}</label>
          <input
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className={fieldClass(!!errors.fullName)}
          />
          {errors.fullName && <p className="text-xs text-rose-500 mt-0.5">{errors.fullName}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground-700 mb-1">{t('phone')}</label>
          <input
            required
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="09XX XXX XXXX"
            className={fieldClass(!!errors.phone)}
          />
          {errors.phone && <p className="text-xs text-rose-500 mt-0.5">{errors.phone}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-foreground-700 mb-1">{t('email')}</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className={fieldClass()}
        />
      </div>

      <PhilippineAddressSelect
        province={form.province}
        city={form.city}
        barangay={form.barangay}
        onChange={handleAddressChange}
        streetSlot={
          <div>
            <input
              value={form.addressLine}
              onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
              className={fieldClass()}
              placeholder="House/Street"
            />
          </div>
        }
      />
      {errors.province && <p className="text-xs text-rose-500 mt-0.5">{errors.province}</p>}

      <div>
        <label className="block text-xs font-medium text-foreground-700 mb-1">{t('customerType')}</label>
        <select
          value={form.customerType}
          onChange={(e) => setForm({ ...form, customerType: e.target.value })}
          className={fieldClass()}
        >
          <option value="residential">{t('residential')}</option>
          <option value="small_commercial">{t('commercial')}</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-foreground-700 mb-1">{t('bill')}</label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="1000"
            max="50000"
            step="500"
            value={form.monthlyBillPhp}
            onChange={(e) => setForm({ ...form, monthlyBillPhp: Number(e.target.value) })}
            className="flex-1 opt-slider"
          />
          <span className="text-primary-500 font-semibold min-w-[90px] text-right text-sm">
            ₱{form.monthlyBillPhp.toLocaleString()}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-foreground-700 mb-1">{t('message')}</label>
        <textarea
          rows={2}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className={fieldClass() + ' resize-none'}
        />
      </div>

      {error && (
        <p className="text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 rounded-lg bg-primary-500 text-background-50 font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
      >
        {loading ? <Spinner className="w-4 h-4" /> : t('submit')}
      </button>
    </form>
  );
}
