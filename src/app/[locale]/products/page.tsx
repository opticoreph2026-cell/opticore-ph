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
    <div className="bento-card flex flex-col">
      <p className="text-xs font-mono text-accent-blue mb-2">{inv.sku}</p>
      <p className="text-lg font-bold mb-4">{inv.output}</p>
      <dl className="space-y-2 text-sm flex-1">
        <div className="flex justify-between">
          <dt className="text-white/40">{t('maxPv')}</dt>
          <dd className="text-white/80">{inv.maxPv}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-white/40">{t('backup')}</dt>
          <dd className="text-white/80">{inv.backup}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-white/40">{t('transferTime')}</dt>
          <dd className="text-white/80">{inv.transferTime}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-white/40">{t('certifications')}</dt>
          <dd className="text-white/80 text-[10px]">{inv.certs}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-white/40">{t('warranty')}</dt>
          <dd className="text-white/80">{inv.warranty}</dd>
        </div>
      </dl>
      <Link
        href="/contact"
        className="mt-4 w-full py-2 text-center text-sm bg-accent-blue text-white font-semibold rounded-xl hover:bg-accent-blue/90 transition-colors"
      >
        {t('getQuote')}
      </Link>
    </div>
  );
}

function BatteryCard({ bat, t }: { bat: typeof NEOVOLT_BATTERIES[number]; t: (key: string) => string }) {
  return (
    <div className="bento-card flex flex-col">
      <p className="text-xs font-mono text-white/40 mb-2">{bat.sku}</p>
      <p className="text-2xl font-bold text-accent-blue mb-2">{bat.usable}</p>
      <dl className="space-y-1 text-sm flex-1">
        <div className="flex justify-between">
          <dt className="text-white/40">{t('chemistry')}</dt>
          <dd className="text-white/80">{bat.chemistry}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-white/40">{t('voltage')}</dt>
          <dd className="text-white/80">{bat.voltage}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-white/40">{t('cycles')}</dt>
          <dd className="text-white/80">{bat.cycles}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-white/40">{t('warranty')}</dt>
          <dd className="text-white/80">{bat.warranty}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-white/40">{t('dod')}</dt>
          <dd className="text-white/80">{bat.dod}</dd>
        </div>
      </dl>
      <Link
        href="/contact"
        className="mt-4 w-full py-2 text-center text-sm bg-accent-blue text-white font-semibold rounded-xl hover:bg-accent-blue/90 transition-colors"
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
      <main className="bg-surface-1000 text-white min-h-screen pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">{t('title')}</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">{t('subtitle')}</p>
          </AnimatedSection>

          <AnimatedSection className="mb-16" delay={0.1}>
            <h2 className="text-2xl font-display font-bold mb-2 text-accent-blue">
              {t('singlePhase')}
            </h2>
            <p className="text-sm text-gray-400 mb-6">{t('singlePhaseIntro')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {NEOVOLT_INVERTERS_SINGLE.map((inv) => (
                <InverterCard key={inv.sku} inv={inv} t={t} />
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection className="mb-16" delay={0.2}>
            <h2 className="text-2xl font-display font-bold mb-2 text-accent-cyan">
              {t('threePhase')}
            </h2>
            <p className="text-sm text-gray-400 mb-6">{t('threePhaseIntro')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {NEOVOLT_INVERTERS_THREE.map((inv) => (
                <InverterCard key={inv.sku} inv={inv} t={t} />
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection className="mb-16" delay={0.3}>
            <h2 className="text-2xl font-display font-bold mb-2">{t('batteries')}</h2>
            <p className="text-sm text-gray-400 mb-6">{t('batteriesIntro')}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {NEOVOLT_BATTERIES.map((bat) => (
                <BatteryCard key={bat.sku} bat={bat} t={t} />
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection className="mb-16" delay={0.4}>
            <h2 className="text-2xl font-display font-bold mb-2">{t('bundles')}</h2>
            <p className="text-sm text-gray-400 mb-6">{t('bundlesSubtitle')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {SYSTEM_PRESETS.map((preset) => (
                <div key={preset.name} className="bento-card flex flex-col border-t-4 border-t-accent-blue">
                  <h3 className="font-bold text-white mb-3">{t(preset.name === 'Starter Home' ? 'starterHome' : preset.name === 'Standard Home' ? 'standardHome' : preset.name === 'Premium Home' ? 'premiumHome' : 'commercial')}</h3>
                  <dl className="space-y-1 text-sm flex-1">
                    <div className="flex justify-between">
                      <dt className="text-white/40">System</dt>
                      <dd className="text-white/80 font-mono text-xs text-right">{preset.inverter} + {preset.battery}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-white/40">Storage</dt>
                      <dd className="text-white/80">{preset.storage}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-white/40">PV Array</dt>
                      <dd className="text-white/80">{preset.pv}</dd>
                    </div>
                  </dl>
                  <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                    {preset.desc}
                  </p>
                  <Link
                    href="/contact"
                    className="mt-3 w-full py-2 text-center text-sm bg-accent-blue text-white font-semibold rounded-xl hover:bg-accent-blue/90 transition-colors"
                  >
                    {t('getQuote')}
                  </Link>
                </div>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection className="text-center mb-12" delay={0.5}>
            <p className="text-gray-400 mb-2 text-sm">{t('pricingNote')}</p>
          </AnimatedSection>

          <AnimatedSection className="glass-panel rounded-2xl p-8 text-center" delay={0.6}>
            <p className="text-white font-bold mb-2">{t('notSure')}</p>
            <p className="text-gray-400 text-sm mb-6">{t('notSureCta')}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/calculator"
                className="px-6 py-2.5 rounded-xl bg-surface-800 border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors"
              >
                ROI Calculator
              </Link>
              <Link
                href="/contact"
                className="px-6 py-2.5 rounded-xl bg-accent-blue text-white font-semibold hover:bg-accent-blue/90 transition-colors"
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
