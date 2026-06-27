import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { WhatsAppButton } from '@/components/landing/WhatsAppButton';
import { ScrollToTop } from '@/components/landing/ScrollToTop';
import {
  NEOVOLT_INVERTERS_SINGLE,
  NEOVOLT_INVERTERS_THREE,
  NEOVOLT_BATTERIES,
  SYSTEM_PRESETS,
} from '@/data/neovolt-products';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { ShieldCheck, Zap, Battery, Package } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'products' });
  return {
    title: `${t('title')} | OptiCore Energy Solutions`,
    description: `Neovolt ESS product catalog — single-phase residential and three-phase commercial systems. LFP batteries, IEC-certified inverters.`,
    openGraph: {
      title: `${t('title')} | OptiCore Energy Solutions`,
      description: `Neovolt ESS product catalog — single-phase residential and three-phase commercial systems. LFP batteries, IEC-certified inverters.`,
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
  };
}

type InverterType = typeof NEOVOLT_INVERTERS_SINGLE[number] | typeof NEOVOLT_INVERTERS_THREE[number];

function InverterCard({ inv, t }: { inv: InverterType; t: (key: string) => string }) {
  return (
    <div className="bento-card flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500" />
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-primary-500" />
        <p className="text-[10px] font-mono text-primary-500 font-medium">{inv.sku}</p>
      </div>
      <p className="text-lg font-bold text-foreground-950 mb-4">{inv.output}</p>
      <dl className="space-y-2 text-sm flex-1">
        <div className="flex justify-between">
          <dt className="text-foreground-500">{t('maxPv')}</dt>
          <dd className="text-foreground-800">{inv.maxPv}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-foreground-500">{t('backup')}</dt>
          <dd className="text-foreground-800">{inv.backup}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-foreground-500">{t('transferTime')}</dt>
          <dd className="text-foreground-800">{inv.transferTime}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-foreground-500">{t('certifications')}</dt>
          <dd className="text-foreground-800 text-[10px]">{inv.certs}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-foreground-500">{t('warranty')}</dt>
          <dd className="text-foreground-800">{inv.warranty}</dd>
        </div>
      </dl>
      <Link
        href="/contact"
        className="mt-4 w-full py-2 text-center text-sm bg-primary-500 text-background-50 font-semibold rounded-xl hover:bg-primary-600 transition-all cta-primary"
      >
        {t('getQuote')}
      </Link>
    </div>
  );
}

function BatteryCard({ bat, t }: { bat: typeof NEOVOLT_BATTERIES[number]; t: (key: string) => string }) {
  return (
    <div className="bento-card flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-secondary-500 to-accent-500" />
      <div className="flex items-center gap-2 mb-3">
        <Battery className="w-4 h-4 text-secondary-500" />
        <p className="text-[10px] font-mono text-foreground-500 font-medium">{bat.sku}</p>
      </div>
      <p className="text-2xl font-bold text-primary-500 mb-2">{bat.usable}</p>
      <dl className="space-y-1 text-sm flex-1">
        <div className="flex justify-between">
          <dt className="text-foreground-500">{t('chemistry')}</dt>
          <dd className="text-foreground-800">{bat.chemistry}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-foreground-500">{t('voltage')}</dt>
          <dd className="text-foreground-800">{bat.voltage}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-foreground-500">{t('cycles')}</dt>
          <dd className="text-foreground-800">{bat.cycles}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-foreground-500">{t('warranty')}</dt>
          <dd className="text-foreground-800">{bat.warranty}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-foreground-500">{t('dod')}</dt>
          <dd className="text-foreground-800">{bat.dod}</dd>
        </div>
      </dl>
      <Link
        href="/contact"
        className="mt-4 w-full py-2 text-center text-sm bg-primary-500 text-background-50 font-semibold rounded-xl hover:bg-primary-600 transition-all cta-primary"
      >
        {t('getQuote')}
      </Link>
    </div>
  );
}

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('products');

  return (
    <>
      <Navbar />
      <main className="bg-background-50 min-h-screen pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary-500 opt-pulse-dot" />
              <span className="text-[10px] font-semibold text-primary-500 uppercase tracking-widest">Product Catalog</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground-950 mb-4">{t('title')}</h1>
            <p className="text-foreground-600 max-w-2xl mx-auto text-lg">{t('subtitle')}</p>
          </AnimatedSection>

          <AnimatedSection className="mb-16" delay={0.1}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-500" />
              </div>
              <h2 className="text-2xl font-display font-bold text-primary-500">
                {t('singlePhase')}
              </h2>
            </div>
            <p className="text-sm text-foreground-600 mb-6 ml-11">{t('singlePhaseIntro')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {NEOVOLT_INVERTERS_SINGLE.map((inv) => (
                <InverterCard key={inv.sku} inv={inv} t={t} />
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection className="mb-16" delay={0.2}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-accent-500" />
              </div>
              <h2 className="text-2xl font-display font-bold text-accent-500">
                {t('threePhase')}
              </h2>
            </div>
            <p className="text-sm text-foreground-600 mb-6 ml-11">{t('threePhaseIntro')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {NEOVOLT_INVERTERS_THREE.map((inv) => (
                <InverterCard key={inv.sku} inv={inv} t={t} />
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection className="mb-16" delay={0.3}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-secondary-500/10 border border-secondary-500/20 flex items-center justify-center">
                <Battery className="w-4 h-4 text-secondary-500" />
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground-950">
                {t('batteries')}
              </h2>
            </div>
            <p className="text-sm text-foreground-600 mb-6 ml-11">{t('batteriesIntro')}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {NEOVOLT_BATTERIES.map((bat) => (
                <BatteryCard key={bat.sku} bat={bat} t={t} />
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection className="mb-16" delay={0.4}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
                <Package className="w-4 h-4 text-primary-500" />
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground-950">
                {t('bundles')}
              </h2>
            </div>
            <p className="text-sm text-foreground-600 mb-6 ml-11">{t('bundlesSubtitle')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {SYSTEM_PRESETS.map((preset, idx) => {
                const borderColors = ['border-t-primary-500', 'border-t-accent-500', 'border-t-secondary-500', 'border-t-primary-500'];
                return (
                <div key={preset.name} className={`bento-card flex flex-col relative overflow-hidden ${borderColors[idx]}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className={`w-4 h-4 ${idx === 1 ? 'text-accent-500' : idx === 2 ? 'text-secondary-500' : 'text-primary-500'}`} />
                    <h3 className="font-bold text-foreground-950">{t(preset.name === 'Starter Home' ? 'starterHome' : preset.name === 'Standard Home' ? 'standardHome' : preset.name === 'Premium Home' ? 'premiumHome' : 'commercial')}</h3>
                  </div>
                  <dl className="space-y-1 text-sm flex-1">
                    <div className="flex justify-between">
                      <dt className="text-foreground-500">System</dt>
                      <dd className="text-foreground-800 font-mono text-xs text-right">{preset.inverter} + {preset.battery}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-foreground-500">Storage</dt>
                      <dd className="text-foreground-800">{preset.storage}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-foreground-500">PV Array</dt>
                      <dd className="text-foreground-800">{preset.pv}</dd>
                    </div>
                  </dl>
                  <p className="text-xs text-foreground-500 mt-4 leading-relaxed">
                    {preset.desc}
                  </p>
                  <Link
                    href="/contact"
                    className="mt-3 w-full py-2 text-center text-sm bg-primary-500 text-background-50 font-semibold rounded-xl hover:bg-primary-600 transition-colors"
                  >
                    {t('getQuote')}
                  </Link>
                </div>
                );
              })}
            </div>
          </AnimatedSection>

          <AnimatedSection className="text-center mb-12" delay={0.5}>
            <p className="text-foreground-600 mb-2 text-sm">{t('pricingNote')}</p>
          </AnimatedSection>

          <AnimatedSection className="glass-panel rounded-3xl p-8 md:p-12 text-center relative overflow-hidden" delay={0.6}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
            <p className="text-foreground-950 font-bold text-lg mb-2">{t('notSure')}</p>
            <p className="text-foreground-600 text-sm mb-8">{t('notSureCta')}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <Link
                href="/calculator"
                className="px-6 py-3 rounded-xl bg-background-100/40 border border-foreground-950/10 text-foreground-950 font-semibold hover:bg-background-200 transition-all cta-glass"
              >
                ROI Calculator
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3 rounded-xl bg-primary-500 text-background-50 font-semibold hover:bg-primary-600 transition-all cta-primary shadow-lg shadow-primary-500/20"
              >
                Book Free Consultation
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </>
  );
}
