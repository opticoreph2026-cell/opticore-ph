'use client';

import { useState, useEffect } from 'react';
import {
  Settings, Zap, Droplets, Save, CheckCircle, CircleAlert,
  ShieldCheck, Lock, Eye, EyeOff, X, BellRing, Crown,
  Trash2, AlertTriangle, User
} from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [providers, setProviders] = useState({ electricity: [], water: [] });
  const [form, setForm] = useState({
    electricProvider: '',
    waterProvider: '',
    name: '',
    email: '',
    avatar: '',
    plan: 'starter',
    isGoogleAccount: false,
    emailAlertsEnabled: true,
  });

  const [saving, setSaving]                 = useState(false);
  const [status, setStatus]                 = useState(null);
  const [loading, setLoading]               = useState(true);
  const [showPwModal, setShowPwModal]       = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [eRes, wRes, meRes] = await Promise.all([
          fetch('/api/dashboard/providers?type=electricity'),
          fetch('/api/dashboard/providers?type=water'),
          fetch('/api/auth/me'),
        ]);
        const [eData, wData, meData] = await Promise.all([
          eRes.json(), wRes.json(), meRes.json()
        ]);
        setProviders({
          electricity: eData.providers ?? [],
          water: wData.providers ?? [],
        });
        setForm(p => ({
          ...p,
          name:               meData.user?.name ?? '',
          email:              meData.user?.email ?? '',
          avatar:             meData.user?.avatar ?? '',
          electricProvider:   meData.user?.electricProvider ?? '',
          waterProvider:      meData.user?.waterProvider ?? '',
          plan:               meData.user?.planTier ?? 'starter',
          isGoogleAccount:    !!meData.user?.googleId,
          emailAlertsEnabled: meData.user?.emailAlertsEnabled ?? true,
        }));
      } catch { /* ok */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch('/api/dashboard/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section:            'settings',
          name:               form.name,
          avatar:             form.avatar,
          electricProvider:   form.electricProvider,
          waterProvider:      form.waterProvider,
          emailAlertsEnabled: form.emailAlertsEnabled,
        }),
      });
      if (res.ok) {
        setStatus('success');
        router.refresh();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-up max-w-2xl pb-10">

      {/* ── Page Header ── */}
      <div>
        <p className="section-label mb-1">Account</p>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-brand-400" />
          Settings
        </h1>
        <p className="text-sm text-white/40 mt-1">
          Manage your account security and utility preferences.
        </p>
      </div>

      {/* ── Status banners ── */}
      {status === 'success' && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.25)' }}>
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-300">Preferences saved successfully.</p>
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <CircleAlert className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">Failed to save. Please try again.</p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">

        {/* ── Profile ── */}
        <div className="bento-card p-6 group relative">
          <div className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.15), transparent)' }} />
          <h2 className="font-bold text-white mb-5 flex items-center gap-2.5 text-sm tracking-wide">
            <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Eye className="w-3.5 h-3.5 text-white/40" />
            </div>
            Profile Information
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 mb-8 items-center sm:items-start">
            <div className="relative group/avatar">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-500/20 to-cyan-500/20 p-[1px] shadow-2xl">
                <div className="w-full h-full rounded-[23px] bg-surface-1000 flex items-center justify-center overflow-hidden relative">
                  {form.avatar ? (
                    <Image src={form.avatar} alt="Avatar" fill className="object-cover transition-transform duration-500 group-hover/avatar:scale-110" />
                  ) : (
                    <User className="w-8 h-8 text-white/20" />
                  )}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-surface-900 border border-white/10 flex items-center justify-center shadow-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div className="flex-1 space-y-4 w-full">
              <div>
                <label className="block text-[9px] uppercase font-black text-white/25 mb-2 tracking-[0.2em]">Profile Avatar URL</label>
                <input
                  className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  placeholder="https://example.com/avatar.jpg"
                  value={form.avatar}
                  onChange={e => setForm({ ...form, avatar: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
            <div>
              <label className="block text-[9px] uppercase font-black text-white/25 mb-2 tracking-[0.2em]">Full Name</label>
              <input
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase font-black text-white/25 mb-2 tracking-[0.2em]">Email Address</label>
              <input
                className="w-full px-4 py-3 rounded-xl text-sm text-white/40 cursor-not-allowed"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                value={form.email}
                disabled readOnly
              />
            </div>
          </div>
        </div>

        {/* ── Notifications ── */}
        <div className="bento-card p-6 group relative">
          <div className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.15), transparent)' }} />
          <h2 className="font-bold text-white mb-1.5 flex items-center gap-2.5 text-sm tracking-wide">
            <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
              style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.20)' }}>
              <BellRing className="w-3.5 h-3.5 text-brand-400" />
            </div>
            Notification Preferences
          </h2>
          <p className="text-xs text-white/35 mb-5 leading-relaxed pl-8">
            Manage how OptiCore communicates critical events to you.
          </p>
          <label className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-colors ml-8"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <p className="text-sm font-bold text-white mb-1">Email Anomaly Alerts</p>
              <p className="text-[11px] text-white/35">
                Receive proactive warnings when ghost loads or consumption spikes are detected.
              </p>
            </div>
            <div className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={form.emailAlertsEnabled}
                onChange={e => setForm(p => ({ ...p, emailAlertsEnabled: e.target.checked }))}
              />
              <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"
                style={{ background: 'rgba(255,255,255,0.1)' }} />
            </div>
          </label>
        </div>

        {/* ── Utility Providers ── */}
        <div className="bento-card p-6 group relative">
          <div className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(96,165,250,0.15), transparent)' }} />
          <h2 className="font-bold text-white mb-1.5 flex items-center gap-2.5 text-sm tracking-wide">
            <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
              style={{ background: 'rgba(96,165,250,0.10)', border: '1px solid rgba(96,165,250,0.20)' }}>
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
            </div>
            Utility Ecosystem
          </h2>
          <p className="text-xs text-white/35 mb-5 leading-relaxed pl-8">
            Select your providers so the AI Auditor uses hyper-local Philippine tier rates.
          </p>
          <div className="space-y-4 pl-8">
            <div>
              <label className="flex items-center gap-1.5 text-[9px] uppercase font-black text-white/25 mb-2 tracking-[0.2em]">
                <Zap className="w-3 h-3 text-brand-400" /> Electricity Provider
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                value={form.electricProvider}
                onChange={e => setForm(p => ({ ...p, electricProvider: e.target.value }))}
              >
                <option value="" style={{ background: '#111118' }}>— Select electricity provider —</option>
                {providers.electricity.map(p => (
                  <option key={p.id} value={p.id} style={{ background: '#111118' }}>
                    {p.name} {p.region ? `· ${p.region}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[9px] uppercase font-black text-white/25 mb-2 tracking-[0.2em]">
                <Droplets className="w-3 h-3 text-blue-400" /> Water Provider
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                value={form.waterProvider}
                onChange={e => setForm(p => ({ ...p, waterProvider: e.target.value }))}
              >
                <option value="" style={{ background: '#111118' }}>— Select water provider —</option>
                {providers.water.map(p => (
                  <option key={p.id} value={p.id} style={{ background: '#111118' }}>
                    {p.name} {p.region ? `· ${p.region}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary h-11 px-10 flex items-center justify-center gap-2"
        >
          {saving ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
          {saving ? 'Synchronizing…' : 'Update Preferences'}
        </button>
      </form>

      {/* ── Security ── */}
      <div className="bento-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.20)' }}>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm tracking-wide">Security &amp; Access</h2>
              <p className="text-xs text-white/35 mt-1 leading-relaxed">
                Manage your account password and security tokens.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPwModal(true)}
            className="text-xs font-bold px-5 h-10 rounded-xl flex items-center gap-2 transition-all"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.20)', color: '#34d399' }}
          >
            <Lock className="w-3.5 h-3.5" /> Change Password
          </button>
        </div>
      </div>

      {/* ── Plan card ── */}
      <div className="bento-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 relative group/crown overflow-hidden">
              <div className="absolute inset-0 bg-brand-500/10 group-hover/crown:bg-brand-500/20 transition-colors" />
              <Logo className="w-7 h-7 relative z-10" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm tracking-wide">Subscription Plan</h2>
              <p className="text-xs text-white/35 mt-1 capitalize leading-relaxed">
                You are on the <strong className="text-brand-400">{form.plan}</strong> tier.
                {form.plan === 'starter' && ' Upgrade to unlock advanced analytics & AI forecasting.'}
              </p>
            </div>
          </div>
          {form.plan === 'starter' ? (
            <Link href="/pricing" className="btn-primary text-xs px-5 h-9 flex items-center gap-1.5 shrink-0">
              <Zap className="w-3.5 h-3.5" /> Upgrade
            </Link>
          ) : (
            <span className="px-3 py-1.5 rounded-lg text-xs font-bold text-brand-400 capitalize"
              style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.20)' }}>
              {form.plan}
            </span>
          )}
        </div>
      </div>

      {/* ── Danger Zone ── */}
      <div className="rounded-2xl p-6"
        style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}>
        <h2 className="font-bold text-red-400 flex items-center gap-2.5 text-sm mb-2 tracking-wide">
          <AlertTriangle className="w-4 h-4" /> Danger Zone
        </h2>
        <p className="text-xs text-white/30 mb-5 leading-relaxed pl-6">
          Permanently delete your account and all associated utility data. This action cannot be undone.
        </p>
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="text-xs font-bold px-6 h-10 rounded-xl flex items-center gap-2 ml-6 transition-all"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete My Account
        </button>
      </div>

      {/* ── Modals ── */}
      {showPwModal    && <ChangePasswordModal onClose={() => setShowPwModal(false)} />}
      {showDeleteModal && <DeleteAccountModal isGoogleAccount={form.isGoogleAccount} onClose={() => setShowDeleteModal(false)} />}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Change Password Modal — fixed 3-level scroll-safe structure
───────────────────────────────────────────────────────── */
function ChangePasswordModal({ onClose }) {
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPw, setSavingPw] = useState(false);
  const [pwStatus, setPwStatus] = useState(null);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPwStatus(null);
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwStatus({ type: 'error', message: 'New passwords do not match.' });
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwStatus({ type: 'error', message: 'New password must be at least 8 characters.' });
      return;
    }
    setSavingPw(true);
    try {
      const res  = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwStatus({ type: 'success', message: 'Password updated successfully!' });
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => onClose(), 2000);
      } else {
        setPwStatus({ type: 'error', message: data.error || 'Failed to change password.' });
      }
    } catch {
      setPwStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setSavingPw(false);
    }
  };

  return (
    /* Level 1 — fixed overlay with scroll */
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="fixed inset-0 bg-black/65 backdrop-blur-md" onClick={() => !savingPw && onClose()} />
      {/* Level 2 — centering wrapper */}
      <div className="relative min-h-full flex items-center justify-center p-4 py-8">
        {/* Level 3 — modal panel */}
        <div
          className="relative w-full max-w-md rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(16,16,24,0.95)',
            backdropFilter: 'blur(32px) saturate(180%)',
            WebkitBackdropFilter: 'blur(32px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 32px 80px rgba(0,0,0,0.7)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.20)' }}>
                <Lock className="w-4 h-4 text-brand-400" />
              </div>
              <h2 className="text-base font-bold text-white">Change Password</h2>
            </div>
            <button onClick={onClose} disabled={savingPw}
              className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.05] transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {pwStatus && (
              <div className={`mb-5 flex items-center gap-3 px-4 py-3 rounded-xl ${
                pwStatus.type === 'success'
                  ? 'text-emerald-300'
                  : 'text-red-300'
              }`}
                style={{
                  background: pwStatus.type === 'success' ? 'rgba(16,185,129,0.10)' : 'rgba(239,68,68,0.10)',
                  border: pwStatus.type === 'success' ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(239,68,68,0.25)',
                }}>
                {pwStatus.type === 'success'
                  ? <CheckCircle className="w-4 h-4 shrink-0" />
                  : <CircleAlert className="w-4 h-4 shrink-0" />}
                <p className="text-sm">{pwStatus.message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: 'Current Password', key: 'currentPassword', showToggle: true },
                { label: 'New Password',     key: 'newPassword',     placeholder: 'Minimum 8 characters' },
                { label: 'Confirm Password', key: 'confirmPassword', placeholder: 'Repeat new password' },
              ].map(({ label, key, placeholder, showToggle }) => (
                <div key={key}>
                  <label className="block text-[10px] uppercase font-bold text-white/30 mb-2 tracking-wider">{label}</label>
                  <div className="relative">
                    <input
                      type={showToggle && showPw ? 'text' : 'password'}
                      required
                      className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all pr-10"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                      placeholder={placeholder || ''}
                      value={pwForm[key]}
                      onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })}
                    />
                    {showToggle && (
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} disabled={savingPw}
                  className="flex-1 h-11 text-xs font-bold rounded-xl transition-all text-white/40 hover:text-white/70"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={savingPw}
                  className="btn-primary flex-1 h-11 text-xs flex items-center justify-center gap-2">
                  {savingPw ? <Spinner size="sm" /> : <ShieldCheck className="w-4 h-4" />}
                  {savingPw ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Delete Account Modal — fixed 3-level scroll-safe structure
───────────────────────────────────────────────────────── */
function DeleteAccountModal({ isGoogleAccount, onClose }) {
  const [password, setPassword] = useState('');
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState(null);

  const handleDelete = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res  = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        window.location.href = '/?deleted=true';
      } else {
        setError(data.error || 'Failed to delete account.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    /* Level 1 — fixed overlay with scroll */
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={() => !saving && onClose()} />
      {/* Level 2 — centering wrapper */}
      <div className="relative min-h-full flex items-center justify-center p-4 py-8">
        {/* Level 3 — modal panel */}
        <div
          className="relative w-full max-w-md rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(16,16,24,0.97)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(239,68,68,0.25)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)' }}>
                <Trash2 className="w-4 h-4 text-red-400" />
              </div>
              <h2 className="text-base font-bold text-white">Delete Account</h2>
            </div>
            <button onClick={onClose} disabled={saving}
              className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.05] transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="mb-5 p-4 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)' }}>
              <p className="text-sm text-red-300 leading-relaxed">
                ⚠️ This will permanently delete your account, all readings, reports, and appliances.
                <strong className="block mt-1">This cannot be undone.</strong>
              </p>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl text-red-300 text-sm"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)' }}>
                <CircleAlert className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <form onSubmit={handleDelete} className="space-y-4">
              {!isGoogleAccount && (
                <div>
                  <label className="block text-[10px] uppercase font-bold text-white/30 mb-2 tracking-wider">
                    Confirm with your password
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(239,68,68,0.25)' }}
                    placeholder="Enter your current password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} disabled={saving}
                  className="flex-1 h-11 text-xs font-bold rounded-xl transition-all text-white/40 hover:text-white/70"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || (!isGoogleAccount && !password)}
                  className="flex-1 h-11 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
                  style={{ background: 'rgba(220,38,38,0.85)', color: '#fff' }}
                >
                  {saving ? <Spinner size="sm" /> : <Trash2 className="w-4 h-4" />}
                  {saving ? 'Deleting...' : 'Yes, Delete Everything'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
