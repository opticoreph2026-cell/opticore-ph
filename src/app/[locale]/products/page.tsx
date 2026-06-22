import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import {
  NEOVOLT_INVERTERS_SINGLE,
  NEOVOLT_INVERTERS_THREE,
  NEOVOLT_BATTERIES,
  SYSTEM_PRESETS,
} from '@/data/neovolt-products';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'products' });
  return { title: `${t('title')} | OptiCore Energy Solutions` };
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
      <main className="bg-[#08080B] text-white min-h-screen pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">{t('title')}</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">{t('subtitle')}</p>
          </div>

          <section className="mb-16">
            <h2 className="text-2xl font-display font-bold mb-6 text-accent-cyan">
              {t('singlePhase')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {NEOVOLT_INVERTERS_SINGLE.map((inv) => (
                <div key={inv.sku} className="bento-card">
                  <p className="text-xs font-mono text-accent-amber mb-2">{inv.sku}</p>
                  <p className="text-lg font-bold mb-3">{inv.output}</p>
                  <dl className="space-y-1 text-sm text-white/50">
                    <div className="flex justify-between">
                      <dt>Max PV</dt>
                      <dd className="text-white/80">{inv.maxPv}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Backup</dt>
                      <dd className="text-white/80">{inv.backup}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-display font-bold mb-6 text-accent-emerald">
              {t('threePhase')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {NEOVOLT_INVERTERS_THREE.map((inv) => (
                <div key={inv.sku} className="bento-card">
                  <p className="text-xs font-mono text-accent-emerald mb-2">{inv.sku}</p>
                  <p className="text-lg font-bold mb-3">{inv.output}</p>
                  <p className="text-sm text-white/50">
                    Max PV: <span className="text-white/80">{inv.maxPv}</span>
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-display font-bold mb-6">LFP Batteries</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {NEOVOLT_BATTERIES.map((bat) => (
                <div key={bat.sku} className="bento-card">
                  <p className="text-xs font-mono text-white/40 mb-2">{bat.sku}</p>
                  <p className="text-2xl font-bold text-accent-cyan mb-2">{bat.usable}</p>
                  <p className="text-sm text-white/50">
                    {bat.voltage} · {bat.cycles} cycles
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-display font-bold mb-6">Recommended Presets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SYSTEM_PRESETS.map((preset) => (
                <div key={preset.name} className="glass-panel rounded-2xl p-6">
                  <h3 className="font-bold text-white mb-3">{preset.name}</h3>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <dt className="text-white/40">Inverter</dt>
                    <dd className="text-white/80 font-mono text-xs">{preset.inverter}</dd>
                    <dt className="text-white/40">Battery</dt>
                    <dd className="text-white/80 font-mono text-xs">{preset.battery}</dd>
                    <dt className="text-white/40">Storage</dt>
                    <dd className="text-white/80">{preset.storage}</dd>
                    <dt className="text-white/40">PV Array</dt>
                    <dd className="text-white/80">{preset.pv}</dd>
                  </dl>
                </div>
              ))}
            </div>
          </section>

          <div className="text-center">
            <p className="text-gray-400 mb-6">{t('contactCta')}</p>
            <Link
              href="/contact"
              className="inline-block px-8 py-3 rounded-full bg-[#F5A524] text-[#08080B] font-semibold hover:bg-[#F5A524]/90 transition-colors"
            >
              {t('viewSpecs')}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
