'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check, Zap, ArrowRight, Loader2, Sparkles, Shield, Building2 } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import Toast from '@/components/ui/Toast';

const PLANS = [
  {
    name:      'Starter',
    priceId:   'free',
    basePrice: 0,
    tagline:   'For households getting started with energy tracking.',
    highlight: false,
    icon:      Zap,
    iconColor: 'text-text-muted',
    iconBg:    'bg-white/5',
    cta:       'Get Started Free',
    href:      '/signup',
    features: [
      '1 property / account',
      'Basic AI intelligence',
      'Phantom load detection',
      'Up to 5 profiled appliances',
      '3-month visual history',
      'Basic email alerts',
    ],
  },
  {
    name:      'Pro',
    priceId:   'pro',
    basePrice: 499,
    tagline:   'For households serious about deep optimization.',
    highlight: true,
    badge:     'Most Popular',
    icon:      Sparkles,
    iconColor: 'text-brand-400',
    iconBg:    'bg-brand-500/15',
    cta:       'Upgrade to Pro',
    href:      '/signup?plan=pro',
    features: [
      'Everything in Starter',
      '2 properties / account',
      'Weather & Climate Analytics',
      'Financial ROI Hardware Simulator',
      'Instant Monthly HTML Digests',
      'Unlimited Appliances',
      'Offline PDF Chart Exports',
      '1-Year Data History',
    ],
  },
  {
    name:      'Business',
    priceId:   'business',
    basePrice: 2499,
    tagline:   'For property managers, SMEs & sub-metering.',
    highlight: false,
    icon:      Building2,
    iconColor: 'text-blue-400',
    iconBg:    'bg-blue-500/10',
    cta:       'Upgrade to Business',
    href:      '/signup?plan=business',
    features: [
      'Everything in Pro',
      'Predictive AI Forecasting',
      'Peer-to-Peer Benchmarking',
      '3+ Property scopes',
      'Max-Tier Gemini 1.5 Flash Analytics',
      'White-glove Support',
    ],
  },
];

const FAQ = [
  {
    q: 'Which utility providers are supported?',
    a: 'All of them. OptiCore PH is provider-agnostic — Meralco, VECO, Davao Light, Cebu Light, MORE Power, MCWD, Manila Water, Maynilad, BENECO, and any other Philippine utility. Rates are maintained in our database and updated regularly.',
  },
  {
    q: "How does the AI know my provider's rates?",
    a: 'When you select your provider, our system retrieves its current approved tariff rates and industry benchmarks from our Edge database. The AI uses these exact figures when generating your recommendations — no guessing.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We accept all major credit/debit cards, GCash, GrabPay, and Maya via PayMongo. All payments are processed securely.',
  },
  {
    q: 'Is my data private?',
    a: 'Yes. We comply with the Philippine Data Privacy Act of 2012 (PDPA). Your utility data is encrypted and never sold to third parties. See our Privacy Policy for full details.',
  },
];

function FAQItem({ q, a, isOpen, onClick }) {
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.055)' }} className="last:border-0">
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="font-semibold text-text-primary group-hover:text-brand-400 transition-colors">{q}</span>
        <ArrowRight
          className={`w-4 h-4 text-text-muted transition-transform duration-200 shrink-0 ml-4 ${isOpen ? 'rotate-90 text-brand-400' : ''}`}
        />
      </button>
      <div className={`grid transition-all duration-200 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100 pb-5' : 'grid-rows-[0fr] opacity-0'}`}>
        <p className="overflow-hidden text-sm text-text-muted leading-relaxed pr-8">{a}</p>
      </div>
    </div>
  );
}


export default function PricingClient() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan');
  const [isYearly,    setIsYearly]    = useState(false);
  const [openFaq,     setOpenFaq]     = useState(0);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [toastMsg,    setToastMsg]    = useState(null);
  const [toastType,   setToastType]   = useState('info');

  const isLoggedIn = status === 'authenticated';
  const userRole   = session?.user?.role;

  // Auto-trigger checkout if plan is in URL
  useEffect(() => {
    if (isLoggedIn && planParam && (planParam === 'pro' || planParam === 'business')) {
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        handleCheckout(planParam);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, planParam]);

  async function handleCheckout(priceId) {
    if (status === 'loading') return;

    if (!isLoggedIn) { 
      window.location.href = `/signup?plan=${priceId}`; 
      return; 
    }
    setLoadingPlan(priceId);
    try {
      const res  = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          plan: priceId,
          interval: isYearly ? 'yearly' : 'monthly'
        }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else { 
        setToastMsg(data.error ?? 'Could not start checkout. Please try again.'); 
        setToastType('error'); 
      }
    } catch {
      setToastMsg('Network error. Please try again.'); 
      setToastType('error');
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col">
      <Navbar />
      <main className="flex-1 pt-28 pb-20 px-4">
        <div className="max-w-6xl mx-auto">

          {/* ── Header ── */}
          <div className="text-center mb-12 animate-fade-up">
            <p className="section-label mb-3">Pricing</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4 tracking-tight">
              Simple, Honest Pricing
            </h1>
            <p className="text-text-secondary max-w-xl mx-auto leading-relaxed">
              Start free. Upgrade when you need more properties, deeper AI analysis, or business features.
              All plans include nationwide provider support.
            </p>
          </div>

          {/* ── Billing Toggle ── */}
          <div className="flex justify-center mb-14">
            <div
              className="inline-flex items-center gap-1 p-1 rounded-xl"
              style={{ background: 'rgba(22,22,32,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <button
                onClick={() => setIsYearly(false)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                  !isYearly
                    ? 'bg-surface-700 text-text-primary shadow-sm'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                  isYearly
                    ? 'text-brand-400'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
                style={isYearly ? {
                  background: 'rgba(34,211,238,0.10)',
                  border: '1px solid rgba(34,211,238,0.2)',
                } : {}}
              >
                Yearly
                <span className="px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wider font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* ── Plans Bento Grid ── */}
          <div className="grid md:grid-cols-3 gap-6 mb-24 items-stretch pt-14 relative z-10">
            {PLANS.map((plan) => {
              const currentPrice  = isYearly && plan.basePrice > 0 ? Math.floor(plan.basePrice * 0.8) : plan.basePrice;
              const displayPrice  = plan.basePrice === 0 ? 'Free' : `₱${currentPrice.toLocaleString()}`;
              const PlanIcon      = plan.icon;

              return (
                <div
                  key={plan.name}
                  className="bento-card flex flex-col relative group"
                  style={plan.highlight ? {
                    border: '1px solid rgba(34,211,238,0.35)',
                    boxShadow: '0 0 60px rgba(34,211,238,0.1), 0 1px 0 rgba(255,255,255,0.05) inset, 0 8px 32px rgba(0,0,0,0.5)',
                    background: 'linear-gradient(160deg, rgba(10,20,25,0.95) 0%, rgba(5,5,8,0.98) 100%)',
                  } : {}}
                >
                  {/* Popular badge */}
                  {plan.badge && (
                    <div
                      className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-[0.18em] font-black whitespace-nowrap z-30"
                      style={{
                        background: 'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)',
                        color: '#020204',
                        boxShadow: '0 4px 20px rgba(34,211,238,0.4)',
                      }}
                    >
                      {plan.badge}
                    </div>
                  )}

                  {/* Card content */}
                  <div className="p-8 flex flex-col gap-0 flex-1">
                    {/* Plan header */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className={`w-12 h-12 rounded-2xl ${plan.iconBg} border ${plan.highlight ? 'border-brand-500/30' : 'border-white/10'} flex items-center justify-center transition-transform group-hover:scale-110 duration-500`}>
                          <PlanIcon className={`w-6 h-6 ${plan.iconColor}`} />
                        </div>
                        {plan.highlight && (
                          <span
                            className="text-[9px] font-black uppercase tracking-[0.15em] text-brand-400 px-2.5 py-1 rounded-lg"
                            style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)' }}
                          >
                            Recommended
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] font-black text-text-faint uppercase tracking-[0.25em] mb-2">{plan.name}</p>
                      <div className="flex items-end gap-2 mb-4">
                        <span className={`text-5xl font-black tracking-tight leading-none ${plan.highlight ? 'shimmer-text' : 'text-text-primary'}`}>
                          {displayPrice}
                        </span>
                        {plan.basePrice > 0 && (
                          <span className="text-text-faint text-xs font-semibold mb-1.5">
                            /{isYearly ? 'mo' : 'month'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text-muted leading-relaxed font-medium">{plan.tagline}</p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-4 flex-1 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-3 group/feat">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            plan.highlight ? 'bg-brand-500/15 group-hover/feat:bg-brand-500/25' : 'bg-emerald-500/10'
                          }`}>
                            <Check className={`w-3 h-3 ${plan.highlight ? 'text-brand-400' : 'text-emerald-400'}`} />
                          </div>
                          <span className="text-sm text-text-secondary font-medium leading-snug group-hover/feat:text-text-primary transition-colors">{f}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div className="mt-8">
                      {plan.priceId === 'free' ? (
                        <Link 
                          href={!isLoggedIn ? plan.href : (userRole === 'admin' ? '/admin' : '/dashboard')} 
                          className="btn-ghost w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center hover:bg-white/5 transition-all"
                        >
                          {plan.cta}
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleCheckout(plan.priceId)}
                          disabled={loadingPlan === plan.priceId}
                          className="btn-primary w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                          {loadingPlan === plan.priceId
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                            : plan.cta}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Trust Bar ── */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs text-text-muted font-semibold"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <Shield className="w-3.5 h-3.5 text-brand-500" />
              Secured by PayMongo · Compliant with PDPA 2012 · PCI-DSS Certified Payments
            </div>
          </div>

          {/* ── FAQ ── */}
          <div className="max-w-2xl mx-auto mb-20">
            <div className="text-center mb-10">
              <p className="section-label mb-3">Support</p>
              <h2 className="text-2xl font-bold text-text-primary">Frequently Asked Questions</h2>
            </div>
            <div className="bento-card px-6 py-2">
              {FAQ.map((item, i) => (
                <FAQItem
                  key={i}
                  q={item.q}
                  a={item.a}
                  isOpen={openFaq === i}
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                />
              ))}
            </div>
          </div>

          {/* ── PDPA Note ── */}
          <p className="text-center text-[11px] text-text-faint">
            By subscribing, you agree to our{' '}
            <Link href="/privacy" className="text-brand-400 hover:underline">Privacy Policy</Link>
            {' '}and consent to processing under the Philippine Data Privacy Act of 2012.
          </p>

        </div>
      </main>
      <Footer />
      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg(null)} />
    </div>
  );
}
