import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { ContactForm } from '@/components/landing/ContactForm';
import { WhatsAppButton } from '@/components/landing/WhatsAppButton';
import { ScrollToTop } from '@/components/landing/ScrollToTop';
import { Mail, Phone, Clock } from 'lucide-react';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

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
      <main className="bg-[#08080B] text-white min-h-screen pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">{t('title')}</h1>
            <p className="text-gray-400 max-w-xl mx-auto">{t('subtitle')}</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <AnimatedSection className="lg:col-span-2 glass-panel rounded-3xl p-8" delay={0.1}>
              <ContactForm />
            </AnimatedSection>

            <div className="space-y-6">
              <AnimatedSection className="glass-panel rounded-2xl p-6" delay={0.2}>
                <Phone className="w-5 h-5 text-accent-cyan mb-3" />
                <p className="text-xs text-white/40 uppercase tracking-widest mb-1">{t('info.phone')}</p>
                <a href="tel:+639504692442" className="text-white hover:text-accent-blue transition-colors">
                  +63 950 469 2442
                </a>
              </AnimatedSection>
              <AnimatedSection className="glass-panel rounded-2xl p-6" delay={0.3}>
                <Mail className="w-5 h-5 text-accent-cyan mb-3" />
                <p className="text-xs text-white/40 uppercase tracking-widest mb-1">{t('info.email')}</p>
                <a
                  href="mailto:engineering@opticore.ph"
                  className="text-white hover:text-accent-cyan transition-colors"
                >
                  engineering@opticore.ph
                </a>
              </AnimatedSection>
              <AnimatedSection className="glass-panel rounded-2xl p-6" delay={0.4}>
                <Clock className="w-5 h-5 text-accent-cyan mb-3" />
                <p className="text-xs text-white/40 uppercase tracking-widest mb-1">{t('info.hours')}</p>
                <p className="text-white/80">{t('info.hoursValue')}</p>
              </AnimatedSection>
              <AnimatedSection className="rounded-2xl border border-accent-blue/20 bg-accent-blue/5 p-6" delay={0.5}>
              <p className="text-sm font-semibold text-accent-blue mb-1">Julius Rey S. Gisto, RME</p>
              <p className="text-xs text-white/50">Registered Mechanical Engineer (RME) · PRC Licensed</p>
              </AnimatedSection>
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
