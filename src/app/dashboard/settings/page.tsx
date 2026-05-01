'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Home, CreditCard, Bell, Shield } from 'lucide-react';
import { clsx } from 'clsx';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const TABS = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'properties', label: 'Properties', icon: Home },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy & Security', icon: Shield },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');
  const { data } = useSWR('/api/auth/me', fetcher); // Use auth me endpoint for user data
  
  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col pt-6 pb-20 lg:pb-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-cyan-400" />
          System <span className="text-cyan-400">Settings</span>
        </h1>
        <p className="text-slate-400 font-bold mt-2">
          Manage your account preferences, linked properties, and security configurations.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 shrink-0 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 custom-scrollbar">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left whitespace-nowrap",
                  isActive 
                    ? "bg-white/[0.08] text-white font-bold ring-1 ring-white/20" 
                    : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300 font-bold"
                )}
              >
                <tab.icon className={clsx("w-5 h-5", isActive ? "text-cyan-400" : "text-slate-600")} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-surface-900 border border-white/5 rounded-3xl p-6 lg:p-8 min-h-[500px]">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-black text-white mb-6 border-b border-white/5 pb-4">
              {TABS.find(t => t.id === activeTab)?.label}
            </h2>
            
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                    <input 
                      type="text" 
                      defaultValue={data?.name || ''}
                      className="w-full bg-surface-1000 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                    <input 
                      type="email" 
                      defaultValue={data?.email || ''}
                      readOnly
                      className="w-full bg-surface-1000/50 border border-white/5 rounded-xl px-4 py-3 text-slate-400 cursor-not-allowed font-bold"
                    />
                  </div>
                </div>
                
                <button className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-surface-1000 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] mt-4">
                  Save Changes
                </button>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div className="p-6 border border-white/10 rounded-2xl bg-white/[0.02]">
                  <h3 className="text-sm font-black text-white mb-2">Linked Authentication Providers</h3>
                  <p className="text-xs font-bold text-slate-400 mb-6">Manage how you sign in to OptiCore. As per Phase 5b security upgrades, you can link multiple accounts.</p>
                  
                  <div className="flex items-center justify-between p-4 bg-surface-1000 rounded-xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087C16.6582 14.1327 17.64 11.8636 17.64 9.2045z" fill="#4285F4"/>
                          <path d="M9 18c2.43 0 4.4673-.8064 5.9564-2.1818l-2.9087-2.2582c-.8064.54-1.8382.8591-3.0477.8591-2.3441 0-4.3282-1.5832-5.036-3.7105H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
                          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.6818 9c0-.5905.1018-1.1645.2823-1.71V4.9582H.9574A8.9961 8.9961 0 0 0 0 9c0 1.4523.3477 2.8268.9573 4.0418L3.964 10.71z" fill="#FBBC05"/>
                          <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795z" fill="#EA4335"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Google</p>
                        <p className="text-xs text-emerald-400 font-bold">Connected</p>
                      </div>
                    </div>
                    <button className="text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 px-4 py-2 rounded-lg transition-colors">
                      Unlink
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholders for other tabs */}
            {['properties', 'billing', 'notifications'].includes(activeTab) && (
              <div className="flex items-center justify-center h-48 text-slate-500 font-bold text-sm">
                This module is currently under development.
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
