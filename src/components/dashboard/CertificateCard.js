'use client';

import { useState, useEffect, useRef } from 'react';
import { Award, ShieldCheck, Download, Sparkles, CheckCircle2, Image as ImageIcon, FileText, ChevronDown } from 'lucide-react';
import { toPng } from 'html-to-image';
import Image from 'next/image';
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
    <div className="space-y-8 animate-fade-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6" ref={menuRef}>
        <div>
          <h2 className="text-display text-2xl font-bold text-white flex items-center gap-3">
            <Award className="w-6 h-6 text-cyan-400" />
            Performance Certification
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Algorithmic Grading & Verification</p>
        </div>

        <div className="relative w-full sm:w-auto">
          <button 
            onClick={() => setShowDownloadMenu(!showDownloadMenu)}
            className={`
              flex items-center justify-center gap-3 px-8 py-3.5 rounded-2xl border transition-all duration-300 w-full sm:w-auto
              ${showDownloadMenu 
                ? 'bg-cyan-500 text-slate-950 border-cyan-500 shadow-glass-cyan' 
                : 'bg-white/[0.03] text-white border-white/5 hover:bg-white/[0.08] hover:border-white/10'
              }
              font-black text-[10px] uppercase tracking-[0.2em]
            `}
          >
            <Download className={`w-4 h-4 ${showDownloadMenu ? 'text-slate-950' : 'text-cyan-400'}`} />
            <span>Download Certificate</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-500 ${showDownloadMenu ? 'rotate-180' : ''}`} />
          </button>

          {showDownloadMenu && (
            <div className="absolute top-full right-0 mt-4 w-64 bg-slate-900 border border-white/10 rounded-3xl p-2.5 z-[100] flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-4 duration-500 shadow-glass-lg ring-1 ring-white/5">
              <div className="px-4 py-3 mb-1 border-b border-white/5">
                <span className="text-[9px] uppercase tracking-[0.25em] text-slate-500 font-black">Output Format</span>
              </div>
              <button
                onClick={handleDownloadImage}
                className="flex items-center justify-between group px-5 py-4 text-sm text-white hover:bg-cyan-500/10 rounded-2xl transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold">Image (PNG)</span>
                </div>
                <span className="text-[9px] font-black uppercase bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Ultra</span>
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center justify-between group px-5 py-4 text-sm text-white hover:bg-purple-500/10 rounded-2xl transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span className="font-bold">Document (PDF)</span>
                </div>
                <span className="text-[9px] font-black uppercase bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">PDF/A</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Certificate Wrapper ── */}
      <div className="bento-card p-1.5 md:p-2.5 bg-gradient-to-br from-cyan-500/10 via-slate-900/40 to-purple-500/10 shadow-glass-lg">
        <div className="relative bg-slate-950 border border-white/5 rounded-3xl p-10 md:p-16 overflow-hidden" id="printable-certificate">
          
          {/* Background Textures */}
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-500/[0.03] blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/[0.03] blur-[120px] pointer-events-none" />
          
          {/* Watermark Logo */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.015] pointer-events-none select-none">
            <Image src="/logo.png" alt="" width={450} height={450} className="object-contain grayscale brightness-200" />
          </div>

          <div className="relative z-10 flex flex-col min-h-[650px]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-8 mb-16 border-b border-white/5 pb-10">
               <div className="flex items-center gap-5">
                 <div className="w-16 h-16 bg-white/[0.03] rounded-3xl flex items-center justify-center border border-white/5 shadow-inner-glow-white overflow-hidden p-3 relative">
                   <Image src="/logo.png" alt="OptiCore" fill className="object-contain" />
                 </div>
                 <div className="text-center sm:text-left">
                   <h2 className="text-display text-2xl font-black text-white tracking-[0.2em] uppercase leading-none">OptiCore</h2>
                   <p className="text-[10px] text-cyan-400 font-black tracking-[0.3em] uppercase mt-2">Intelligence Systems</p>
                 </div>
               </div>
               <div className="text-center sm:text-right">
                 <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 mb-2">Verification ID</p>
                 <p className="text-xs text-white font-mono font-bold bg-white/[0.03] px-4 py-1.5 rounded-xl border border-white/5 tracking-wider">{cert.certId}</p>
               </div>
            </div>

            {/* Title Body */}
            <div className="text-center mb-16">
               <p className="text-[11px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-6">CERTIFICATE OF PERFORMANCE</p>
               <h1 className="text-display text-4xl md:text-6xl font-black text-white mb-6 leading-tight">Energy Audit Verification</h1>
               <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed font-medium">This property has been mathematically audited using proprietary thermodynamic and statistical engines for electrical stability and utility preservation.</p>
            </div>

            {/* Grade Hub */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-16 mb-20">
              <div className="relative">
                <div className="w-48 h-48 rounded-[48px] border border-white/5 flex items-center justify-center relative z-10 bg-slate-900 shadow-glass-lg shadow-inner-glow-white">
                  <div className={`absolute inset-0 rounded-[48px] opacity-10 blur-2xl ${cert.score >= 80 ? 'bg-emerald-500' : 'bg-cyan-500'}`} />
                  <div className="text-center">
                    <p className={`text-display text-6xl font-black ${cert.color}`}>{cert.tier}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">Efficiency Rating</p>
                  </div>
                </div>
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-slate-950 px-6 py-2 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-glass-lg z-20">
                  {cert.score} / 100 PTS
                </div>
              </div>

              <div className="flex-1 w-full max-w-sm space-y-6">
                 <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-1.5">Property Holder</p>
                   <p className="text-display text-2xl font-bold text-white border-b border-white/5 pb-2 truncate">{user.name || user.email}</p>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-1.5">Issuance Date</p>
                     <p className="text-base font-bold text-white">{cert.issueDate}</p>
                   </div>
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-1.5">Status</p>
                     <p className="text-base font-bold text-emerald-400 flex items-center gap-2">
                       <ShieldCheck className="w-4 h-4" /> Verified
                     </p>
                   </div>
                 </div>
              </div>
            </div>

            {/* Matrix Breakdown */}
            <div className="grid md:grid-cols-3 gap-6 mt-auto">
              {cert.details.map((detail, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 shadow-inner-glow-white">
                  <div className="flex justify-between items-start mb-4">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                    <span className="text-[10px] font-black text-white bg-white/[0.05] px-3 py-1 rounded-full">{detail.value} PTS</span>
                  </div>
                  <h4 className="text-display text-sm font-bold text-white mb-2 uppercase tracking-wide">{detail.label}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{detail.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 0; size: A4 portrait; }
          * { -webkit-backdrop-filter: none !important; backdrop-filter: none !important; transform: none !important; filter: none !important; }
          body { margin: 0; padding: 0; background: #000 !important; }
          body * { visibility: hidden; }
          #printable-certificate, #printable-certificate * { visibility: visible; }
          #printable-certificate { 
            position: fixed; left: 0; top: 0; width: 100%; height: 100%; 
            background: #050508 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact;
            margin: 0 !important; padding: 40px !important; box-sizing: border-box !important; z-index: 99999 !important;
          }
        }
      `}} />
    </div>
  );
}
