'use client';

import { useState, useEffect, useRef } from 'react';
import { Award, ShieldCheck, Download, Sparkles, CheckCircle2, Image as ImageIcon, FileText, ChevronDown } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export default function CertificateCard({ user }) {
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/dashboard/certification')
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setCert(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to generate certificate');
        setLoading(false);
      });
  }, []);

  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowDownloadMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const handleDownloadImage = async () => {
    setShowDownloadMenu(false);
    const element = document.getElementById('printable-certificate');
    if (!element) return;
    
    try {
      const dataUrl = await toPng(element, {
        pixelRatio: 2,
        backgroundColor: '#0a0a0f',
        style: {
          transform: 'none'
        }
      });
      const link = document.createElement('a');
      link.download = `OptiCore_Certificate_${cert.certId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
    }
  };

  const handleDownloadPDF = async () => {
    setShowDownloadMenu(false);
    const element = document.getElementById('printable-certificate');
    if (!element) return;

    try {
      const dataUrl = await toPng(element, {
        pixelRatio: 2,
        backgroundColor: '#0a0a0f',
        style: {
          transform: 'none'
        }
      });
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const rect = element.getBoundingClientRect();
      const pdfHeight = (rect.height * pdfWidth) / rect.width;
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`OptiCore_Certificate_${cert.certId}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
    }
  };

  if (loading) {
    return (
      <div className="bento-card p-12 flex flex-col items-center justify-center text-center">
        <Sparkles className="w-8 h-8 text-brand-400 animate-pulse mb-4" />
        <p className="text-white font-bold">Algorithmic Grading in Progress...</p>
        <p className="text-sm text-text-muted mt-1">Analyzing historical consumption and hardware matrix.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bento-card p-8 border-red-500/20 bg-red-500/5">
        <p className="text-red-400 font-bold">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end relative z-50 print:hidden" ref={menuRef}>
        <button 
          onClick={() => setShowDownloadMenu(!showDownloadMenu)}
          className={`
            flex items-center gap-2.5 px-6 py-2.5 rounded-xl border transition-all duration-300
            ${showDownloadMenu 
              ? 'bg-brand-500 text-surface-950 border-brand-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]' 
              : 'bg-white/5 text-text-primary border-white/10 hover:bg-white/10 hover:border-white/20'
            }
            font-bold text-xs uppercase tracking-widest
          `}
        >
          <Download className={`w-4 h-4 ${showDownloadMenu ? 'text-surface-950' : 'text-brand-400'}`} />
          <span>Download Certificate</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showDownloadMenu ? 'rotate-180' : ''}`} />
        </button>

        {showDownloadMenu && (
          <div className="absolute top-full right-0 mt-3 w-56 bg-surface-900 border border-white/10 rounded-2xl p-2 z-[60] flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.7)] ring-1 ring-white/5">
            <div className="px-3 py-2 mb-1 border-b border-white/5">
              <span className="text-[9px] uppercase tracking-[0.2em] text-text-muted font-black">Select Format</span>
            </div>
            <button
              onClick={handleDownloadImage}
              className="flex items-center justify-between group px-4 py-3 text-sm text-white hover:bg-brand-500/10 rounded-xl transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <ImageIcon className="w-4 h-4 text-brand-400" />
                <span className="font-semibold">Image (PNG)</span>
              </div>
              <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">High Res</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center justify-between group px-4 py-3 text-sm text-white hover:bg-blue-500/10 rounded-xl transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="font-semibold">Document (PDF)</span>
              </div>
              <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">Standard</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Certificate Wrapper ── */}
      <div className="bento-card p-1 md:p-2 bg-gradient-to-br from-brand-500/20 via-surface-900 to-blue-500/10">
        <div className="relative bg-surface-950 border border-white/5 rounded-2xl p-8 md:p-12 overflow-hidden" id="printable-certificate">
          
          {/* Certificate Background Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
          
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
            <Award className="w-[400px] h-[400px]" />
          </div>

          <div className="relative z-10 flex flex-col min-h-[600px]">
            {/* Header */}
            <div className="flex justify-between items-start mb-12 border-b border-white/10 pb-8">
               <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 overflow-hidden">
                   <img src="/logo.png" alt="OptiCore Logo" className="w-9 h-9 object-contain" />
                 </div>
                 <div>
                   <h2 className="text-xl font-black text-white tracking-widest uppercase">OptiCore</h2>
                   <p className="text-[10px] text-brand-400 font-bold tracking-[0.2em] uppercase">Energy Performance</p>
                 </div>
               </div>
               <div className="text-right">
                 <p className="text-[10px] uppercase tracking-widest text-text-faint font-bold mb-1">Certificate ID</p>
                 <p className="text-xs text-white font-mono bg-white/5 px-2 py-1 rounded border border-white/10">{cert.certId}</p>
               </div>
            </div>

            {/* Title */}
            <div className="text-center mb-12">
               <h1 className="text-3xl md:text-5xl font-serif text-white mb-4">Official Rating Certificate</h1>
               <p className="text-sm text-text-muted max-w-md mx-auto">This property has been mathematically audited for electrical stability, hardware efficiency, and utility preservation.</p>
            </div>

            {/* Score Section */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-12 mb-16">
              {/* The Grade Badge */}
              <div className="relative">
                <div className="w-40 h-40 rounded-full border-4 border-surface-800 flex items-center justify-center relative z-10 bg-surface-900 shadow-2xl">
                  <div className={`absolute inset-0 rounded-full opacity-20 blur-xl ${cert.score >= 80 ? 'bg-emerald-500' : 'bg-brand-500'}`} />
                  <div className="text-center">
                    <p className={`text-5xl font-black ${cert.color}`}>{cert.tier}</p>
                    <p className="text-[10px] uppercase tracking-widest text-text-faint mt-1 font-bold">Grade</p>
                  </div>
                </div>
                {/* Score Ribbon */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-brand-500 text-black px-4 py-1.5 rounded-full font-black text-[11px] uppercase tracking-widest shadow-lg z-20">
                  {cert.score} / 100
                </div>
              </div>

              {/* Property Details */}
              <div className="flex-1 w-full max-w-sm space-y-4 min-w-0">
                 <div className="min-w-0">
                   <p className="text-[10px] uppercase tracking-widest text-text-faint mb-1 font-bold">Property Owner</p>
                   <p className="text-lg font-bold text-white border-b border-white/10 pb-1 truncate">{user.name || user.email}</p>
                 </div>
                 <div>
                   <p className="text-[10px] uppercase tracking-widest text-text-faint mb-1 font-bold">Issue Date</p>
                   <p className="text-sm font-bold text-white border-b border-white/10 pb-1">{cert.issueDate}</p>
                 </div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="grid md:grid-cols-3 gap-4 mt-auto">
              {cert.details.map((detail, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
                  <div className="flex justify-between items-start mb-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-400" />
                    <span className="text-xs font-black text-white bg-white/10 px-2 py-0.5 rounded">{detail.value} pts</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">{detail.label}</h4>
                  <p className="text-xs text-text-muted leading-relaxed">{detail.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
      
      {/* Print styles block directly in JSX to ensure it prints beautifully */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            margin: 0;
          }
          * {
            -webkit-backdrop-filter: none !important;
            backdrop-filter: none !important;
            transform: none !important;
            filter: none !important;
          }
          body {
            margin: 0;
            padding: 0;
          }
          body * { visibility: hidden; }
          #printable-certificate, #printable-certificate * { visibility: visible; }
          #printable-certificate { 
            position: fixed; 
            left: 0; 
            top: 0; 
            width: 100%;
            height: 100%;
            background: #000 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            margin: 0 !important;
            padding: 2rem !important;
            box-sizing: border-box !important;
            z-index: 99999 !important;
          }
        }
      `}} />
    </div>
  );
}
