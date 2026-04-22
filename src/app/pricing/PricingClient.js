'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, Zap, ChevronDown, Loader2, Sparkles, Shield, Building2 } from 'lucide-react';
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
    cta:       'Start Pro Trial',
    href:      '/signup',
    features: [
      'Everything in Starter',
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
    priceId:   'biz',
    basePrice: 2499,
    tagline:   'For property managers, SMEs & sub-metering.',
    highlight: false,
    icon:      Building2,
    iconColor: 'text-blue-400',
    iconBg:    'bg-blue-500/10',
    cta:       'Contact Sales',
    href:      'mailto:opticoreph2026@gmail.com',
    features: [
      'Everything in Pro',
      'Predictive AI Forecasting',
      'Peer-to-Peer Benchmarking',
      '3+ Property scopes',
      'Max-Tier Gemini 2.5 Flash Analytics',
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
        <ChevronDown
          className={`w-4 h-4 text-text-muted transition-transform duration-200 shrink-0 ml-4 ${isOpen ? 'rotate-180 text-brand-400' : ''}`}
        />
      </button>
      <div className={`grid transition-all duration-200 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100 pb-5' : 'grid-rows-[0fr] opacity-0'}`}>
        <p className="overflow-hidden text-sm text-text-muted leading-relaxed pr-8">{a}</p>
      </div>
    </div>
  );
}

export default function PricingClient() {
  const [isYearly,    setIsYearly]    = useState(false);
  const [openFaq,     setOpenFaq]     = useState(0);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [isLoggedIn,  setIsLoggedIn]  = useState(false);
  const [userRole,    setUserRole]    = useState(null);
  const [toastMsg,    setToastMsg]    = useState(null);
  const [toastType,   setToastType]   = useState('info');

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => { 
      if (data.user) {
        setIsLoggedIn(true);
        setUserRole(data.user.role);
      }
    }).catch(() => {});
  }, []);

  async function handleCheckout(priceId) {
    if (!isLoggedIn) { window.location.href = '/signup'; return; }
    setLoadingPlan(priceId);
    try {
      const res  = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: priceId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else { setToastMsg('Could not start checkout. Please try again.'); setToastType('error'); }
    } catch {
      setToastMsg('Network error. Please try again.'); setToastType('error');
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
                  background: 'rgba(245,158,11,0.10)',
                  border: '1px solid rgba(245,158,11,0.2)',
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
          <div className="grid md:grid-cols-3 gap-4 mb-24 items-stretch">
            {PLANS.map((plan) => {
              const currentPrice  = isYearly && plan.basePrice > 0 ? Math.floor(plan.basePrice * 0.8) : plan.basePrice;
              const displayPrice  = plan.basePrice === 0 ? 'Free' : `₱${currentPrice.toLocaleString()}`;
              const PlanIcon      = plan.icon;

              return (
                <div
                  key={plan.name}
                  className="bento-card flex flex-col relative"
                  style={plan.highlight ? {
                    border: '1px solid rgba(245,158,11,0.35)',
                    boxShadow: '0 0 40px rgba(245,158,11,0.12), 0 1px 0 rgba(255,255,255,0.05) inset, 0 8px 32px rgba(0,0,0,0.5)',
                    background: 'linear-gradient(160deg, rgba(30,28,20,0.9) 0%, rgba(18,18,26,0.95) 100%)',
                  } : {}}
                >
                  {/* Popular badge */}
                  {plan.badge && (
                    <div
                      className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] uppercase tracking-[0.18em] font-black whitespace-nowrap z-30"
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: '#0a0a0f',
                        boxShadow: '0 4px 16px rgba(245,158,11,0.4)',
                      }}
                    >
                      {plan.badge}
                    </div>
                  )}

                  {/* Card content */}
                  <div className="p-7 flex flex-col gap-0 flex-1">
                    {/* Plan header */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-5">
                        <div className={`w-10 h-10 rounded-xl ${plan.iconBg} border ${plan.highlight ? 'border-brand-500/30' : 'border-white/10'} flex items-center justify-center`}>
                          <PlanIcon className={`w-5 h-5 ${plan.iconColor}`} />
                        </div>
                        {plan.highlight && (
                          <span
                            className="text-[9px] font-black uppercase tracking-[0.15em] text-brand-400 px-2 py-0.5 rounded-md"
                            style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}
                          >
                            Recommended
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] font-black text-text-faint uppercase tracking-[0.2em] mb-2">{plan.name}</p>
                      <div className="flex items-end gap-1.5 mb-3">
                        <span className={`text-5xl font-black tracking-tight leading-none ${plan.highlight ? 'shimmer-text' : 'text-text-primary'}`}>
                          {displayPrice}
                        </span>
                        {plan.basePrice > 0 && (
                          <span className="text-text-faint text-xs font-medium mb-1.5">
                            /{isYearly ? 'mo, billed yearly' : 'month'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted leading-relaxed">{plan.tagline}</p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 flex-1 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.055)' }}>
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-3">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            plan.highlight ? 'bg-brand-500/20' : 'bg-emerald-500/10'
                          }`}>
                            <Check className={`w-2.5 h-2.5 ${plan.highlight ? 'text-brand-400' : 'text-emerald-400'}`} />
                          </div>
                          <span className="text-sm text-text-secondary font-medium leading-snug">{f}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div className="mt-7">
                      {plan.priceId === 'free' ? (
                        <Link 
                          href={!isLoggedIn ? plan.href : (userRole === 'admin' ? '/admin' : '/dashboard')} 
                          className="btn-ghost w-full text-center"
                        >
                          {plan.cta}
                        </Link>
                      ) : plan.priceId === 'biz' ? (
                        <a href={plan.href} className="btn-ghost w-full text-center">
                          {plan.cta}
                        </a>
                      ) : (
                        <button
                          onClick={() => handleCheckout(plan.priceId)}
                          disabled={loadingPlan === plan.priceId}
                          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-70"
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
