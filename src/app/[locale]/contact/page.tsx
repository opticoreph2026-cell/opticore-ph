import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { ContactForm } from '@/components/landing/ContactForm';
import { WhatsAppButton } from '@/components/landing/WhatsAppButton';
import { ScrollToTop } from '@/components/landing/ScrollToTop';
import { Mail, Phone, Clock, ShieldCheck } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });
  return {
    title: `${t('title')} | OptiCore Energy Solutions`,
    description: `Book a free solar and ESS site visit in Cebu, Bohol, or Leyte. OptiCore responds within 24 hours.`,
    openGraph: {
      title: `${t('title')} | OptiCore Energy Solutions`,
      description: `Book a free solar and ESS site visit in Cebu, Bohol, or Leyte. OptiCore responds within 24 hours.`,
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('contact');

  return (
    <>
      <Navbar />
      <main className="bg-background-50 min-h-screen pb-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary-500/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent-500/5 blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto px-6 pt-32 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary-500 opt-pulse-dot" />
              <span className="text-[10px] font-semibold text-primary-500 uppercase tracking-widest">Get in Touch</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground-950 mb-4">{t('title')}</h1>
            <p className="text-foreground-600 max-w-xl mx-auto text-lg">{t('subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 glass-panel rounded-3xl p-8 md:p-10">
              <h2 className="text-xl font-display font-bold text-foreground-950 mb-6">Free Site Assessment</h2>
              <Suspense fallback={null}>
                <ContactForm />
              </Suspense>
            </div>

            <div className="space-y-4">
              <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent-500/5 rounded-full blur-xl pointer-events-none" />
                <Phone className="w-5 h-5 text-accent-500 mb-3" />
                <p className="text-xs text-foreground-500 uppercase tracking-widest mb-1 font-mono">{t('info.phone')}</p>
                <a href="tel:+639504692442" className="text-foreground-950 hover:text-primary-500 transition-colors font-semibold">
                  +63 950 469 2442
                </a>
              </div>
              <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full blur-xl pointer-events-none" />
                <Mail className="w-5 h-5 text-primary-500 mb-3" />
                <p className="text-xs text-foreground-500 uppercase tracking-widest mb-1 font-mono">{t('info.email')}</p>
                <a
                  href="mailto:engineering@opticore.ph"
                  className="text-foreground-950 hover:text-primary-500 transition-colors font-semibold"
                >
                  engineering@opticore.ph
                </a>
              </div>
              <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-secondary-500/5 rounded-full blur-xl pointer-events-none" />
                <Clock className="w-5 h-5 text-secondary-500 mb-3" />
                <p className="text-xs text-foreground-500 uppercase tracking-widest mb-1 font-mono">{t('info.hours')}</p>
                <p className="text-foreground-700 font-semibold">{t('info.hoursValue')}</p>
              </div>
              <div className="rounded-2xl border border-primary-500/20 bg-primary-500/5 p-6 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-primary-500" />
                  <p className="text-sm font-semibold text-primary-500">Julius Rey S. Gisto, RME</p>
                </div>
                <p className="text-xs text-foreground-500">Registered Mechanical Engineer (RME) · PRC Licensed</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </>
  );
}
