'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const TABS = [
  { id: 'account', label: 'Account', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'properties', label: 'Properties', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'security', label: 'Privacy & Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');
  const { data: profileData, mutate, isLoading } = useSWR('/api/dashboard/profile', fetcher);
  const { toast, error } = useToast();
  
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form when data loads
  React.useEffect(() => {
    if (profileData?.profile?.name) {
      setName(profileData.profile.name);
    }
  }, [profileData]);

  const handleSaveAccount = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/dashboard/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      toast('Profile updated successfully', 'success');
      mutate(); // Refresh SWR
    } catch (err: any) {
      error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col pt-6 pb-20 lg:pb-6 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-3">
          <svg className="w-8 h-8 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          System <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-emerald">Settings</span>
        </h1>
        <p className="text-white/60 text-sm mt-2">
          Manage your account preferences, linked properties, and security configurations.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 shrink-0 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left whitespace-nowrap text-sm font-medium ${
                  isActive 
                    ? "bg-white/10 text-white border border-white/10" 
                    : "text-white/60 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
              >
                <svg className={`w-5 h-5 ${isActive ? "text-accent-cyan" : "text-white/40"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-[500px]">
          <SpotlightCard className="p-6 lg:p-8 h-full">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Spinner className="w-8 h-8" />
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h2 className="text-xl font-medium text-white mb-6 border-b border-border-subtle pb-4">
                  {TABS.find(t => t.id === activeTab)?.label}
                </h2>
                
                {activeTab === 'account' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-accent-cyan uppercase tracking-wider mb-2">Full Name</label>
                        <input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-surface-1000 border border-border-subtle rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Email Address</label>
                        <input 
                          type="email" 
                          defaultValue={profileData?.profile?.email || ''}
                          readOnly
                          className="w-full bg-surface-1000/50 border border-border-subtle/50 rounded-xl px-4 py-3 text-white/40 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleSaveAccount}
                      disabled={isSaving}
                      className="px-6 py-3 bg-gradient-to-r from-accent-cyan to-accent-emerald hover:opacity-90 text-white font-medium rounded-xl transition-all shadow-lg flex items-center gap-2"
                    >
                      {isSaving && <Spinner className="w-4 h-4 text-white" />}
                      Save Changes
                    </button>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div className="p-6 border border-border-subtle rounded-2xl bg-surface-1000">
                      <h3 className="text-sm font-semibold text-white mb-2">Authentication Method</h3>
                      <p className="text-sm text-white/60 mb-6">Manage how you sign in to OptiCore PH. Your account is currently using Email & Password authentication.</p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface-900 rounded-xl border border-border-subtle gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/60">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{profileData?.profile?.email}</p>
                            <p className="text-xs text-accent-emerald font-medium">Primary</p>
                          </div>
                        </div>
                        <button className="text-sm font-medium text-white/80 hover:text-white bg-white/5 px-4 py-2 rounded-lg transition-colors border border-border-subtle">
                          Change Password
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'properties' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                      <p className="text-sm text-white/60">Manage the properties connected to your account.</p>
                      <button className="text-sm font-medium text-accent-cyan hover:text-accent-cyan/80 bg-accent-cyan/10 px-4 py-2 rounded-lg transition-colors">
                        + Add Property
                      </button>
                    </div>
                    {profileData?.profile?.properties?.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {profileData.profile.properties.map((p: any) => (
                          <div key={p.id} className="p-4 bg-surface-1000 border border-border-subtle rounded-xl flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium text-white">{p.name}</p>
                              <p className="text-xs text-white/40 mt-1">{p.electricDU || 'No DU'} &bull; {p.waterUtility || 'No Water Utility'}</p>
                            </div>
                            {p.isDefault && (
                              <span className="text-xs font-medium text-accent-emerald bg-accent-emerald/10 px-2 py-1 rounded">Default</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center p-8 border border-dashed border-border-subtle rounded-xl text-white/40 text-sm">
                        No properties added yet.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </SpotlightCard>
        </div>
      </div>
    </div>
  );
}
