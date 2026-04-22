'use client';

import { useState, useRef } from 'react';
import { Mic, Square, Activity, Loader2, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function AcousticAuditor() {
  const [recording, setRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await analyzeAudio(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      setError(null);
      setResult(null);
      
      // Auto-stop after 5 seconds to get a clean snippet
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording();
        }
      }, 5000);
      
    } catch (err) {
      setError('Microphone access denied or not available. Please allow microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const analyzeAudio = async (blob) => {
    setAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = reader.result;
        const res = await fetch('/api/ai/acoustic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audioData: base64Audio })
        });
        
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to analyze audio.');
        
        setResult(json.data);
      };
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bento-card overflow-hidden relative p-8 md:p-12 text-center" style={{ boxShadow: 'inset 0 0 40px rgba(245,158,11,0.02)' }}>
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
        
        {/* Dynamic ambient glow based on state */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 blur-[80px] rounded-full pointer-events-none transition-colors duration-1000 ${recording ? 'bg-red-500/20' : analyzing ? 'bg-brand-500/20' : 'bg-brand-500/5'}`} />

        <div className="relative z-10 flex flex-col items-center">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-300 shadow-2xl ${recording ? 'bg-red-500/20 text-red-400 border border-red-500/40' : analyzing ? 'bg-brand-500/10 text-brand-400 border border-brand-500/30' : 'bg-surface-800 text-white/40 border border-white/10 hover:border-brand-500/30 hover:text-brand-400 cursor-pointer'}`}
               onClick={!recording && !analyzing ? startRecording : undefined}>
            
            {recording ? (
              <button onClick={(e) => { e.stopPropagation(); stopRecording(); }} className="p-4 rounded-full hover:bg-red-500/20 transition-colors z-20 relative">
                <Square className="w-8 h-8 fill-current" />
              </button>
            ) : analyzing ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <Mic className="w-10 h-10" />
            )}
            
            {recording && (
               <div className="absolute w-24 h-24 rounded-full border-2 border-red-500/40" style={{ animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
            )}
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">
            {recording ? 'Listening to hardware signature...' : analyzing ? 'Running Acoustic Frequency Analysis...' : 'Tap to Start Acoustic Scan'}
          </h3>
          <p className="text-sm text-text-muted max-w-md mx-auto h-10">
            {recording ? 'Hold your device close to the appliance. Scanning automatically finishes in 5 seconds.' : analyzing ? 'OptiCore AI is decoding the compressor hum using Gemini 2.5 Flash...' : 'Ensure background noise is minimized. Hold your microphone near the compressor or motor.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3 animate-fade-up">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="bento-card p-6 animate-fade-up border-t-2" style={{ borderColor: result.status === 'HEALTHY' ? '#10b981' : result.status === 'WARNING' ? '#f59e0b' : '#ef4444' }}>
          <div className="flex items-center gap-3 mb-6">
            {result.status === 'HEALTHY' && <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
            {result.status === 'WARNING' && <AlertTriangle className="w-6 h-6 text-brand-400" />}
            {(result.status === 'CRITICAL' || result.status === 'UNKNOWN') && <ShieldAlert className="w-6 h-6 text-red-400" />}
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-text-faint">Diagnostic Result</p>
              <h4 className="text-lg font-bold text-white">{result.status}</h4>
            </div>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <p className="text-xs font-semibold text-text-muted mb-1">Acoustic Diagnosis</p>
              <p className="text-sm text-white font-medium">{result.diagnosis}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <p className="text-xs font-semibold text-text-muted mb-1">Recommended Action</p>
              <p className="text-sm text-white font-medium">{result.recommendedAction}</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
             <div className="flex-1 p-5 rounded-xl border border-brand-500/20 relative overflow-hidden" style={{ background: 'rgba(245,158,11,0.05)' }}>
                <div className="absolute inset-0 bg-brand-500/10 opacity-50 blur-xl pointer-events-none" />
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-400 mb-1 relative z-10">Phantom Load Penalty</p>
                <div className="flex items-end gap-1 relative z-10">
                  <span className="text-3xl font-black text-white">+{result.phantomLoadPenalty}%</span>
                  <span className="text-xs text-text-muted mb-1.5">wasted energy</span>
                </div>
             </div>
             <div className="flex-1 p-5 rounded-xl border border-red-500/20 relative overflow-hidden" style={{ background: 'rgba(239,68,68,0.05)' }}>
                <div className="absolute inset-0 bg-red-500/10 opacity-50 blur-xl pointer-events-none" />
                <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1 relative z-10">Est. Financial Loss</p>
                <div className="flex items-end gap-1 relative z-10">
                  <span className="text-3xl font-black text-white">₱{result.estimatedWastedCost}</span>
                  <span className="text-xs text-text-muted mb-1.5">/ month</span>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
