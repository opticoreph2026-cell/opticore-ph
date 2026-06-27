import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { WhatsAppButton } from '@/components/landing/WhatsAppButton';
import { ScrollToTop } from '@/components/landing/ScrollToTop';
import { Award, MapPin, Target, CheckCircle, Users, Globe, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });
  return {
    title: `${t('title')} | OptiCore Energy Solutions`,
    description: `Julius Rey S. Gisto, RME — Registered Mechanical Engineer and founder of OptiCore Energy Solutions, Cebu.`,
    openGraph: {
      title: `${t('title')} | OptiCore Energy Solutions`,
      description: `Julius Rey S. Gisto, RME — Registered Mechanical Engineer and founder of OptiCore Energy Solutions, Cebu.`,
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('about');

  return (
    <>
      <Navbar />
      <main className="bg-background-50 min-h-screen pb-16">
        <div className="max-w-4xl mx-auto px-6 pt-32">
          {/* Hero — Design: Readdy-style hero with gradient accent heading */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary-500 opt-pulse-dot" />
              <span className="text-[10px] font-semibold text-primary-500 uppercase tracking-widest">About Us</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground-950 mb-4">{t('title')}</h1>
            <p className="text-foreground-600 max-w-2xl mx-auto text-lg">{t('subtitle')}</p>
          </div>

          {/* Founder */}
          <div className="glass-panel rounded-3xl p-8 md:p-12 mb-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden bg-background-100/40 flex-shrink-0 mx-auto md:mx-0 ring-2 ring-primary-500/20">
                <Image
                  src="/julius-placeholder.png"
                  alt="Julius Rey S. Gisto, RME"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-primary-500" />
                  <p className="text-xs text-primary-500 uppercase tracking-widest font-semibold">
                    {t('founderTitle')}
                  </p>
                </div>
                <h2 className="text-2xl font-display font-bold text-foreground-950 mb-3">{t('founderName')}</h2>
                <p className="text-foreground-600 leading-relaxed mb-6">{t('founderBio')}</p>
                <h3 className="text-xs font-semibold text-foreground-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-secondary-500" />
                  {t('credentials')}
                </h3>
                <ul className="space-y-2">
                  {['cred1', 'cred2', 'cred3', 'cred4'].map((key) => (
                    <li key={key} className="flex items-start gap-2 text-sm text-foreground-600">
                      <CheckCircle className="w-4 h-4 text-secondary-500 mt-0.5 flex-shrink-0" />
                      <span>{t(key)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Partners */}
          <div className="glass-panel rounded-3xl p-8 md:p-12 mb-10">
            <div className="flex items-center gap-3 mb-8">
              <Users className="w-6 h-6 text-accent-500" />
              <h2 className="text-xl font-display font-bold text-foreground-950">{t('partners')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bento-card relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-accent-500" />
                <h3 className="font-bold text-foreground-950 mb-1">{t('partner1Name')}</h3>
                <p className="text-xs text-accent-500 mb-3 font-semibold">{t('partner1Role')}</p>
                <p className="text-sm text-foreground-600">{t('partner1Bio')}</p>
              </div>
              <div className="bento-card relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-secondary-500" />
                <h3 className="font-bold text-foreground-950 mb-1">{t('partner2Name')}</h3>
                <p className="text-xs text-secondary-500 mb-3 font-semibold">{t('partner2Role')}</p>
                <p className="text-sm text-foreground-600">{t('partner2Bio')}</p>
              </div>
            </div>
          </div>

          {/* Mission + Territories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="glass-panel rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-primary-500/5 rounded-full blur-2xl pointer-events-none" />
              <Target className="w-8 h-8 text-primary-500 mb-4" />
              <h2 className="text-xl font-display font-bold text-foreground-950 mb-3">{t('missionTitle')}</h2>
              <p className="text-foreground-600 leading-relaxed text-sm">{t('mission')}</p>
            </div>
            <div className="glass-panel rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary-500/5 rounded-full blur-2xl pointer-events-none" />
              <Globe className="w-8 h-8 text-secondary-500 mb-4" />
              <h2 className="text-xl font-display font-bold text-foreground-950 mb-4">{t('territories')}</h2>
              <div className="space-y-3">
                {['territoryCebu', 'territoryBohol', 'territoryLeyte'].map((key) => (
                  <div key={key} className="flex items-center gap-3 text-sm text-foreground-600">
                    <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    <span>{t(key)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary-500 text-background-50 font-semibold hover:bg-primary-600 transition-all cta-primary shadow-lg shadow-primary-500/20"
            >
              Book a Free Site Visit
              <span className="text-lg">→</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </>
  );
}
