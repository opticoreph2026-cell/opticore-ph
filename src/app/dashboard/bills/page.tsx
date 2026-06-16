'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { BillForm } from '@/components/dashboard/BillForm';
import { BillScanner } from '@/components/dashboard/BillScanner';
import { FileText, Plus, Receipt } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function BillsPage() {
  const { data: billsData, mutate, isLoading } = useSWR('/api/dashboard/bills', fetcher);
  const [activeTab, setActiveTab] = useState<'history' | 'scan' | 'manual'>('history');
  const [scannedData, setScannedData] = useState<any>(null);

  const bills = billsData?.bills || [];

  const handleScanComplete = (data: any) => {
    setScannedData(data);
    setActiveTab('manual'); // Switch to manual form to verify data
  };

  const handleSaveComplete = () => {
    mutate();
    setScannedData(null);
    setActiveTab('history');
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col pt-6 pb-20 lg:pb-6 animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-3">
            <Receipt className="w-8 h-8 text-accent-cyan" />
            Bills & <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-emerald">Usage</span>
          </h1>
          <p className="text-white/60 text-sm mt-2">
            Log, track, and verify your electricity and water bills with automated ERC rate checking.
          </p>
        </div>
        <div className="flex bg-surface-900 border border-border-subtle rounded-xl overflow-hidden self-start md:self-auto p-1">
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'history' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'}`}
          >
            History
          </button>
          <button 
            onClick={() => setActiveTab('scan')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'scan' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'}`}
          >
            Scan Bill
          </button>
          <button 
            onClick={() => { setScannedData(null); setActiveTab('manual'); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'manual' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'}`}
          >
            Manual Entry
          </button>
        </div>
      </div>

      {activeTab === 'history' && (
        <SpotlightCard className="p-6 lg:p-8 min-h-[400px]">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <Spinner className="w-8 h-8" />
            </div>
          ) : bills.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border-subtle text-white/40 uppercase tracking-wider text-xs">
                    <th className="pb-3 font-semibold">Utility</th>
                    <th className="pb-3 font-semibold">Billing Period</th>
                    <th className="pb-3 font-semibold text-right">Consumption</th>
                    <th className="pb-3 font-semibold text-right">Amount Due</th>
                    <th className="pb-3 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {bills.map((bill: any) => (
                    <tr key={bill.id} className="text-white/80 hover:bg-white/5 transition-colors">
                      <td className="py-4 font-medium capitalize">
                        {bill.utilityType === 'electric' && <ZapIcon className="w-4 h-4 inline mr-2 text-accent-cyan" />}
                        {bill.utilityType === 'water' && <WaterIcon className="w-4 h-4 inline mr-2 text-blue-400" />}
                        {bill.utilityType}
                      </td>
                      <td className="py-4">
                        {new Date(bill.billingPeriodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(bill.billingPeriodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-4 text-right">
                        {bill.consumption} {bill.utilityType === 'electric' ? 'kWh' : 'cu.m'}
                      </td>
                      <td className="py-4 text-right font-bold text-white">
                        ₱{(bill.amountDue / 100).toFixed(2)}
                      </td>
                      <td className="py-4 text-center">
                        {bill.ercVerified ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-accent-emerald/10 text-accent-emerald">
                            <CheckIcon className="w-3 h-3" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-white/5 text-white/40">
                            Unverified
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-surface-1000 border border-border-subtle rounded-2xl flex items-center justify-center text-white/40 mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">No Bills Logged</h3>
              <p className="text-white/60 text-sm max-w-md mx-auto mb-6">
                You haven't logged any bills yet. Scan a bill or enter it manually to start tracking your usage.
              </p>
              <button 
                onClick={() => setActiveTab('scan')}
                className="px-6 py-3 bg-gradient-to-r from-accent-cyan to-accent-emerald hover:opacity-90 text-white font-medium rounded-xl transition-all shadow-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Your First Bill
              </button>
            </div>
          )}
        </SpotlightCard>
      )}

      {activeTab === 'scan' && (
        <SpotlightCard className="p-6 lg:p-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-medium text-white mb-6 text-center">Scan Your Bill with AI</h2>
            <BillScanner onScanComplete={handleScanComplete} />
          </div>
        </SpotlightCard>
      )}

      {activeTab === 'manual' && (
        <div className="max-w-3xl mx-auto w-full">
          {scannedData && (
            <div className="mb-6 p-4 bg-accent-emerald/10 border border-accent-emerald/20 rounded-xl flex items-start gap-3">
              <div className="mt-0.5">
                <CheckIcon className="w-5 h-5 text-accent-emerald" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-accent-emerald">Bill Scanned Successfully</h4>
                <p className="text-xs text-white/60 mt-1">We've extracted the details from your bill. Please verify them below before saving.</p>
              </div>
            </div>
          )}
          <BillForm 
            initialData={scannedData} 
            onSuccess={handleSaveComplete}
            onCancel={() => {
              setActiveTab('history');
              setScannedData(null);
            }} 
          />
        </div>
      )}
    </div>
  );
}

function ZapIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function WaterIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function CheckIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
}
