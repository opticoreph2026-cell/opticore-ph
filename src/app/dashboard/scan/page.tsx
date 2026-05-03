'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ScanBillPage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0] as File);
    }
  }, []);

  const handleFileSelection = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/') && selectedFile.type !== 'application/pdf') {
      setErrorMessage('Please upload a valid image or PDF.');
      setScanResult('error');
      return;
    }
    setFile(selectedFile);
    setScanResult(null);
    setErrorMessage('');
  };

  const handleScan = async () => {
    if (!file) return;
    setIsScanning(true);
    setScanResult(null);

    // Mock API Call - Replace with actual /api/ai/scan logic
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate delay for "Scanning..." sweep animation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In a real scenario, we'd POST to /api/ai/scan
      // const res = await fetch('/api/ai/scan', { method: 'POST', body: formData });
      // if (!res.ok) throw new Error('Scan failed');

      setIsScanning(false);
      setScanResult('success');
      
      // Redirect after success
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      setIsScanning(false);
      setScanResult('error');
      setErrorMessage('Failed to read the bill. Please ensure it is clear and well-lit.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col items-center justify-center min-h-[70vh]">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4">
          Scan Your <span className="text-cyan-400">Bill</span>
        </h1>
        <p className="text-slate-400 font-bold max-w-lg mx-auto">
          Upload your electric bill (Meralco, VECO, etc.) and let our AI instantly break down the charges and find savings.
        </p>
      </div>

      <div className="w-full relative">
        <div 
          className={`w-full h-80 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden bg-surface-900/50 ${
            isDragging ? 'border-cyan-500 bg-cyan-500/5' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          {isScanning && (
            <motion.div 
              className="absolute top-0 left-0 h-full w-full bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent pointer-events-none"
              animate={{ y: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            >
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,1)]" />
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div 
                key="upload"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center z-10 p-6"
              >
                <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <UploadCloud className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-black text-white tracking-tight mb-2">Drag & Drop Bill</h3>
                <p className="text-sm font-bold text-slate-500 mb-6">Supports JPG, PNG, or PDF</p>
                <label className="cursor-pointer px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all border border-white/10 text-sm">
                  Browse Files
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelection(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </motion.div>
            ) : (
              <motion.div 
                key="file"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center z-10 w-full px-6 flex flex-col items-center"
              >
                <div className="w-20 h-28 bg-white/[0.05] border border-white/10 rounded-xl flex items-center justify-center mb-6 shadow-2xl relative">
                  <FileText className="w-10 h-10 text-cyan-400" />
                  {!isScanning && scanResult !== 'success' && (
                    <button 
                      onClick={() => setFile(null)}
                      className="absolute -top-3 -right-3 w-8 h-8 bg-surface-800 border border-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2 truncate max-w-xs">{file.name}</h3>
                <p className="text-xs font-bold text-slate-500 mb-8">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

                {scanResult === 'success' ? (
                  <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                    <CheckCircle className="w-5 h-5" />
                    Bill Processed Successfully!
                  </div>
                ) : scanResult === 'error' ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 text-rose-400 font-bold bg-rose-500/10 px-4 py-2 rounded-full border border-rose-500/20">
                      <AlertCircle className="w-5 h-5" />
                      {errorMessage}
                    </div>
                    <button 
                      onClick={() => setFile(null)}
                      className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
                    >
                      Try a different file
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleScan}
                    disabled={isScanning}
                    className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/50 disabled:cursor-not-allowed text-surface-1000 font-black rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] flex items-center gap-3 w-full max-w-xs justify-center"
                  >
                    {isScanning ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Scanning with AI...
                      </>
                    ) : (
                      'Analyze Bill'
                    )}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
