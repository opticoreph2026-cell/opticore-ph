import Link from 'next/link';
import {
  Zap, Droplets, Flame, TrendingDown, Brain, ShieldCheck,
  ChevronRight, ArrowRight, Cpu, 
  Calculator, FileUp, ScanLine, Lock, Sparkles
} from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import LandingCalculator from '@/components/landing/Calculator';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import ProviderMarquee from '@/components/landing/ProviderMarquee';


const TESTIMONIALS = [
  {
    name: 'Maria Santos',
    location: 'Cebu City',
    savings: '₱1,250/mo',
    text: 'Found a 15W phantom load on my old heater and realized my AC was costing me ₱4,000 alone. The AI recommendations helped me cut my VECO bill by 20% in just one month.',
  },
  {
    name: 'Juan Dela Cruz',
    location: 'Quezon City',
    savings: '₱2,100/mo',
    text: 'Upgrading my 10-year-old fridge to an inverter model paid for itself in 8 months. The ROI simulator used my exact Meralco rate, which made the decision easy.',
  },
  {
    name: 'Elena Reyes',
    location: 'Davao City',
    savings: '₱850/mo',
    text: 'I had no idea what system loss and transmission charges meant until Gemini broke it down. Now I know exactly where every peso goes on my Davao Light bill.',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: FileUp,
    title: 'Ingest Utility Data',
    desc: 'Snap a photo of your Electricity or Water bill. Our Gemini AI reads unstructured documents automatically.',
  },
  {
    step: '02',
    icon: ScanLine,
    title: 'Rate Self-Learning',
    desc: 'The system strips generation charges, VAT, and water tariffs, dynamically crowdsourcing nation-wide rates.',
  },
  {
    step: '03',
    icon: Brain,
    title: 'Deterministic Math',
    desc: 'Deep analytical cross-referencing against Master Appliance catalogs to detect ghost loads and underwater leaks.',
  },
  {
    step: '04',
    icon: TrendingDown,
    title: 'Household Optimization',
    desc: 'Receive alerts when LPG tanks are depleting, track ROI on aircon upgrades, and watch baseline usage drop.',
  },
];

const FEATURES = [
  {
    icon: ScanLine,
    title: 'Nationwide OCR',
    desc: 'Upload any Philippine utility bill (VECO, Meralco, Manila Water). Gemini extracts charges unbundled and self-learns local tariffs.',
    color: 'text-brand-400',
    bg: 'bg-brand-500/10',
    border: 'border-brand-500/20',
    tag: 'INTELLIGENCE',
  },
  {
    icon: Droplets,
    title: 'Hydration Leak Guard',
    desc: 'Trailing-average computation engines monitor your cubic-meter (m³) consumption, deploying alerts if spontaneous pipe leaks occur.',
    color: 'text-white',
    bg: 'bg-white/5',
    border: 'border-white/10',
    tag: 'NEW',
  },
  {
    icon: Flame,
    title: 'LPG Burn Predictor',
    desc: 'Stop running out of cooking gas. Track active tank depletion rates in real-time, pinging you exactly when it’s time to order a Solane refill.',
    color: 'text-white',
    bg: 'bg-white/5',
    border: 'border-white/10',
    tag: 'NEW',
  },
  {
    icon: Calculator,
    title: 'Hardware Simulator',
    desc: 'Execute exact ROI calculations for appliance upgrades. Know exactly how many months until that new Inverter AC pays for itself.',
    color: 'text-white',
    bg: 'bg-white/5',
    border: 'border-white/10',
  },
  {
    icon: Cpu,
    title: 'Master Data Catalog',
    desc: 'Fuzzy-search real engineering specifications using our Master Catalog. Stop guessing wattage, inject verified parameters.',
    color: 'text-white',
    bg: 'bg-white/5',
    border: 'border-white/10',
  },
  {
    icon: Lock,
    title: 'Encrypted Vaults',
    desc: 'All household analytics are secured with JWT and OTP email verification, maintaining strict data sovereignty.',
    color: 'text-white',
    bg: 'bg-white/5',
    border: 'border-white/10',
  },
];

const TECH_STACK = [
  { label: 'Gemini 2.5 Flash', desc: 'Multimodal Parsing' },
  { label: 'Next.js 14', desc: 'App Router' },
  { label: 'LibSQL', desc: 'Edge Database' },
  { label: 'Fuse.js', desc: 'Fuzzy Catalog Search' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-950 flex flex-col overflow-x-hidden">
      <Navbar />

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <main className="flex-1">
        <section className="relative pt-40 pb-20 px-4">
          {/* Monochrome Professional Backgrounds */}
          <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none z-0" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-500/5 blur-[150px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[11px] font-bold text-white mb-8 shadow-2xl">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse-slow" />
              Version 2.0. The Nationwide Resource Protocol.
            </div>

            {/* Headline */}
            <h1 className="text-display text-5xl sm:text-6xl md:text-7xl font-normal leading-tight mb-6">
              <span className="text-white">The Ultimate</span>
              <br />
              <span className="text-brand-400 font-black drop-shadow-[0_0_25px_rgba(245,158,11,0.2)]">
                Command Center.
              </span>
            </h1>

            <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              OptiCore PH utilizes Deterministic Mathematics & <span className="text-white">Gemini Vision AI</span> to structurally map your Electricity, Water, and LPG consumption natively in your browser.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/signup" className="text-sm font-black uppercase tracking-widest px-8 py-4 rounded-xl text-black bg-white hover:bg-gray-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center gap-2">
                Deploy Server <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="/#how-it-works" className="text-sm font-black uppercase tracking-widest px-8 py-4 rounded-xl text-white bg-white/5 hover:bg-white/10 transition-all border border-white/10">
                View Architecture
              </Link>
            </div>

            {/* Animated Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto pt-8 border-t border-white/5">
              {[
                { label: 'Nationwide Bills Scanned', val: '14,502' },
                { label: 'Target Rate Gathered', val: '11.45', prefix: '₱' },
                { label: 'Ghost Logic Found', val: '2,500', prefix: '₱' },
                { label: 'Compute Speed', val: '150', unit: 'ms' },
              ].map(({ label, val, prefix, unit }) => (
                <div key={label} className="flex flex-col items-center justify-center p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl ring-1 ring-white/[0.02] shadow-2xl backdrop-blur-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-t from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  <p className="text-3xl font-black text-white mb-2 tracking-tighter flex items-center gap-1 drop-shadow-md">
                    {prefix && <span className="text-lg text-text-muted">{prefix}</span>}
                    <AnimatedNumber value={val} duration={2000} />
                    {unit && <span className="text-sm text-text-muted">{unit}</span>}
                  </p>
                  <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Provider Marquee ───────────────────────────────────────── */}
        <ProviderMarquee />

        {/* ── Features ───────────────────────────────────────────────── */}
        <section className="py-24 px-4 bg-surface-950 relative">
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-400 mb-3">Intelligence Infrastructure</p>
              <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
                Built for the <span className="italic font-light">Philippines</span>
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map(({ icon: Icon, title, desc, color, bg, border, tag }) => (
                <div key={title} className="bg-surface-900 border border-white/[0.05] p-8 rounded-2xl hover:border-white/20 transition-all duration-300 relative overflow-hidden group">
                  <div className={`absolute top-0 right-0 w-32 h-32 ${bg} blur-3xl opacity-0 group-hover:opacity-50 transition-all duration-700`} />
                  <div className="flex items-start justify-between mb-6 relative z-10">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${border} shadow-lg`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    {tag && (
                      <span className={`text-[9px] font-black uppercase tracking-wider ${color} ${bg} ${border} border px-2.5 py-1 rounded-full`}>
                        {tag}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3 tracking-tight relative z-10">{title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed relative z-10">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Interactive Calculator ──────────────────────────────────── */}
        <section className="py-24 px-4 border-y border-white/[0.04] bg-surface-950">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-3">
                Electrical ROI Simulator
              </h2>
              <p className="text-text-muted text-sm">
                Understand the math before buying expensive hardware.
              </p>
            </div>
            <LandingCalculator />
          </div>
        </section>

        {/* ── Testimonials ───────────────────────────────────────────── */}
        <section className="py-24 px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Live Field Reports
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/[0.05] p-8 rounded-2xl flex flex-col justify-between hover:bg-white/[0.04] transition-all"
                  style={{ borderTop: '2px solid rgba(245,158,11,0.5)' }}
                >
                  <div>
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
                      <div className="flex text-amber-500 gap-1">
                        {[...Array(5)].map((_, j) => (
                          <svg key={j} className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                        ))}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2 py-1 rounded-lg">
                        Saved {t.savings}
                      </span>
                    </div>
                    <p className="text-sm text-text-muted leading-loose italic mb-8">
                      "{t.text}"
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-5 border-t border-white/[0.04]">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white font-bold text-sm">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{t.name}</p>
                      <p className="text-[11px] text-text-faint">{t.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing Preview ────────────────────────────────────────── */}
        <section className="py-24 px-4 bg-surface-900 border-t border-white/[0.04]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Deterministic Pricing
              </h2>
              <p className="text-text-muted mt-3">Start analyzing your footprint completely free.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Starter */}
              <div className="bg-surface-950 border border-white/[0.05] p-8 rounded-2xl flex flex-col">
                <h3 className="text-xl font-bold text-white mb-1">Starter</h3>
                <p className="text-sm text-text-faint mb-6">For individuals</p>
                <div className="text-4xl font-black text-white mb-8">Free</div>
                <ul className="space-y-4 mb-10 flex-1">
                  {['1 AI bill scan/mo', '5 Appliances max', 'Basic alerts', '1 Property'].map(ft => (
                    <li key={ft} className="flex items-center gap-3 text-sm text-text-muted">
                      <ShieldCheck className="w-4 h-4 text-brand-500/50" /> {ft}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="text-sm font-black uppercase tracking-widest text-center px-4 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-all">Get Started</Link>
              </div>
              
              {/* Pro */}
              <div className="bg-white/[0.03] border border-amber-500/30 p-8 rounded-2xl relative flex flex-col shadow-[0_0_50px_rgba(245,158,11,0.05)] transform md:-translate-y-4 z-10 box-border">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full whitespace-nowrap shadow-xl">
                  Enterprise Grade
                </div>
                <h3 className="text-xl font-bold text-amber-400 mb-1 mt-2">Pro</h3>
                <p className="text-sm text-text-muted mb-6">Full autonomous analytics</p>
                <div className="flex items-end gap-1 mb-8">
                  <span className="text-xl text-text-faint mb-1">₱</span>
                  <span className="text-5xl font-black text-white">499</span>
                  <span className="text-sm text-text-faint mb-2">/mo</span>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {['Unlimited AI Vision', 'Water Leak Algorithm', 'LPG Empty Forecaster', 'Hardware Simulator'].map(ft => (
                    <li key={ft} className="flex items-center gap-3 text-sm text-white">
                      <ShieldCheck className="w-4 h-4 text-amber-400" /> {ft}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="text-sm font-black uppercase tracking-widest text-center px-4 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-black hover:opacity-90 transition-all shadow-[0_5px_20px_rgba(245,158,11,0.2)]">Upgrade Sub</Link>
              </div>
              
              {/* Business */}
              <div className="bg-surface-950 border border-white/[0.05] p-8 rounded-2xl flex flex-col">
                <h3 className="text-xl font-bold text-white mb-1">Business</h3>
                <p className="text-sm text-text-faint mb-6">Multi-property scale</p>
                <div className="flex items-end gap-1 mb-8">
                  <span className="text-xl text-text-faint mb-1">₱</span>
                  <span className="text-4xl font-black text-white">2,499</span>
                  <span className="text-sm text-text-faint mb-2">/mo</span>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {['Multiple Facilities', 'Aggregated Exporting', 'Team access', 'Priority API'].map(ft => (
                    <li key={ft} className="flex items-center gap-3 text-sm text-text-muted">
                      <ShieldCheck className="w-4 h-4 text-brand-500/50" /> {ft}
                    </li>
                  ))}
                </ul>
                <Link href="/pricing" className="text-sm font-black uppercase tracking-widest text-center px-4 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-all">View Sheet</Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

