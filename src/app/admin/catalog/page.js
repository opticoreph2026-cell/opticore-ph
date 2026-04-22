'use client';

import { useState } from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { UploadCloud, FileSpreadsheet, Loader2, Database, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminCatalogUpload() {
  const [csvContent, setCsvContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: '' }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setStatus({ type: 'error', message: 'Please upload a valid .csv file' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvContent(event.target.result);
      setStatus(null);
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!csvContent) {
      setStatus({ type: 'error', message: 'No CSV loaded.' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/admin/catalog/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent })
      });
      const data = await res.json();

      if (res.ok) {
         setStatus({ type: 'success', message: data.message });
         setCsvContent(''); // reset
      } else {
         setStatus({ type: 'error', message: data.error || 'Upload failed' });
      }

    } catch (err) {
      setStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col">
      <Navbar />
      <main className="flex-1 pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          
          <div className="mb-10 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 mb-2">Admin Command Module</p>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Database className="w-8 h-8 text-cyan-500" />
                Master Catalog Ingestion
              </h1>
              <p className="text-sm text-text-muted mt-2">
                Upload CSV dumps from SM Appliance or Manufacturer specs to update the Fuse.js engine globally.
              </p>
            </div>
            <Link href="/dashboard" className="text-xs text-text-muted hover:text-white transition-colors">
              &larr; Back to Dashboard
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Uploader Column */}
            <div className="bento-card p-8 border-cyan-500/20" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.03) 0%, rgba(10,10,15,0.8) 100%)' }}>
              <h2 className="text-lg font-bold text-white mb-6">Drop Configuration File</h2>
              
              <label 
                htmlFor="csv-upload" 
                className={`w-full flex justify-center px-6 py-10 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300
                  ${csvContent ? 'border-cyan-500/40 bg-cyan-500/5' : 'border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.02]'}`}
              >
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-cyan-500/10 flex items-center justify-center mb-4">
                    {csvContent ? <FileSpreadsheet className="w-6 h-6 text-cyan-400" /> : <UploadCloud className="w-6 h-6 text-text-muted" />}
                  </div>
                  <div className="text-sm font-medium text-white">
                    {csvContent ? 'CSV Loaded Successfully' : 'Select a CSV file'}
                  </div>
                  <p className="text-xs text-text-faint mt-1">Maximum size: 10MB</p>
                </div>
                <input id="csv-upload" type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
              </label>

              {status && (
                <div className={`mt-5 p-4 rounded-xl flex items-start gap-3 border ${status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                  {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
                  <p className="text-sm font-medium">{status.message}</p>
                </div>
              )}

              <button 
                onClick={handleUpload}
                disabled={!csvContent || loading}
                className="w-full mt-6 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed
                  bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              >
                {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Ingesting Data...</span> : 'Execute Injection'}
              </button>
            </div>

            {/* Documentation Column */}
            <div className="bento-card p-8 bg-surface-900 border-white/5">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" /> Strict Schema Requirements
              </h3>
              <p className="text-sm text-text-muted mb-6">
                The parsing algorithm strictly requires the following exact header column names in row 1 of your CSV.
              </p>
              
              <div className="bg-black/40 rounded-xl border border-white/5 p-4 font-mono text-[11px] text-emerald-400 overflow-x-auto mb-6">
                <p>brand,model,category,wattage,eer,coolingcapacity</p>
                <p className="text-text-faint mt-2">Panasonic,CS-XU10XKQ,AC,720,13.5,9500</p>
                <p className="text-text-faint">LG,HS-09ISB,AC,850,11.2,9000</p>
                <p className="text-text-faint">Samsung,RT20FARVDSA,Fridge,120,,</p>
              </div>

              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Allowed Categories (Exact mapping)</h4>
              <ul className="grid grid-cols-2 gap-2 text-xs text-text-secondary">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> AC</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Fridge</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Heater</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Pump</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> WaterFixture</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> GasStove</li>
              </ul>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
