'use client';

import { useState, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Calculator, Zap, Power, Share2 } from 'lucide-react';

export default function SulitModeSimulator() {
  const [acTemp, setAcTemp] = useState(24);
  const [lightsOff, setLightsOff] = useState(2);
  const [standbyOff, setStandbyOff] = useState(5);

  // Baseline mock values
  const currentBill = 4250.50; 
  const [savings, setSavings] = useState(0);

  // Smooth animated counter for savings
  const animatedSavings = useSpring(0, { bounce: 0, duration: 800 });
  const displaySavings = useTransform(animatedSavings, (latest) => 
    `₱${latest.toFixed(2)}`
  );

  useEffect(() => {
    // Basic mock calculation for visual feedback
    // AC: Each degree above 22 saves ~5% of AC load (assumed 1500 per month)
    const acSavings = Math.max(0, (acTemp - 22)) * 0.05 * 1500;
    // Lights: Each hour off saves ~10 pesos
    const lightsSavings = lightsOff * 10;
    // Standby: Each device unplugged saves ~15 pesos
    const standbySavings = standbyOff * 15;

    const total = acSavings + lightsSavings + standbySavings;
    setSavings(total);
    animatedSavings.set(total);
  }, [acTemp, lightsOff, standbyOff, animatedSavings]);

  const projectedBill = currentBill - savings;

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col pt-6 pb-20 lg:pb-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Calculator className="w-8 h-8 text-cyan-400" />
          Sulit Mode <span className="text-cyan-400">Simulator</span>
        </h1>
        <p className="text-slate-400 font-bold mt-2">
          Adjust your habits below to see how much you can save on your next bill in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Sliders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Slider 1: AC Temp */}
          <div className="bg-surface-900 border border-white/5 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20">
                  <Zap className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Aircon Temperature</h3>
                  <p className="text-xs text-slate-500 font-bold">Higher temp = lower bill</p>
                </div>
              </div>
              <span className="text-2xl font-black text-cyan-400">{acTemp}°C</span>
            </div>
            <input 
              type="range" 
              min="16" max="28" 
              value={acTemp}
              onChange={(e) => setAcTemp(Number(e.target.value))}
              className="w-full accent-cyan-500 h-2 bg-surface-1000 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs font-bold text-slate-500 mt-2">
              <span>16°C (High Cost)</span>
              <span>28°C (Max Savings)</span>
            </div>
          </div>

          {/* Slider 2: Lights Off */}
          <div className="bg-surface-900 border border-white/5 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                  <Zap className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Lights Off Earlier</h3>
                  <p className="text-xs text-slate-500 font-bold">Hours turned off early</p>
                </div>
              </div>
              <span className="text-2xl font-black text-amber-400">{lightsOff} hrs</span>
            </div>
            <input 
              type="range" 
              min="0" max="6" 
              value={lightsOff}
              onChange={(e) => setLightsOff(Number(e.target.value))}
              className="w-full accent-amber-500 h-2 bg-surface-1000 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Slider 3: Standby Power */}
          <div className="bg-surface-900 border border-white/5 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                  <Power className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Unplug Idle Devices</h3>
                  <p className="text-xs text-slate-500 font-bold">Devices unplugged at night</p>
                </div>
              </div>
              <span className="text-2xl font-black text-purple-400">{standbyOff} dev</span>
            </div>
            <input 
              type="range" 
              min="0" max="15" 
              value={standbyOff}
              onChange={(e) => setStandbyOff(Number(e.target.value))}
              className="w-full accent-purple-500 h-2 bg-surface-1000 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Right Col: Savings Result */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-surface-800 border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col h-[400px]">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8 text-center">
              Your Projected Bill
            </h2>
            
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="line-through text-slate-500 font-bold text-xl mb-2">
                ₱{currentBill.toFixed(2)}
              </div>
              <div className="text-5xl font-black text-white tracking-tighter mb-4">
                ₱{projectedBill.toFixed(2)}
              </div>
              
              <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-emerald-400 font-black tracking-tight flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-emerald-500 mb-1">Total Savings</span>
                <motion.span className="text-2xl">{displaySavings}</motion.span>
              </div>
            </div>

            <button className="w-full mt-8 py-4 bg-white/[0.05] hover:bg-white/[0.1] text-white font-bold rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" />
              Share Challenge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
