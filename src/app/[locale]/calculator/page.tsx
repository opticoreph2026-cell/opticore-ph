import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { Calculator } from '@/components/landing/Calculator';
import { WhatsAppButton } from '@/components/landing/WhatsAppButton';
import { ScrollToTop } from '@/components/landing/ScrollToTop';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'calculator' });
  return {
    title: `${t('pageTitle')} | OptiCore Energy Solutions`,
    description: `Estimate your solar savings and ESS payback period. Philippine utility rates, real Neovolt system sizing, 25-year ROI.`,
    openGraph: {
      title: `${t('pageTitle')} | OptiCore Energy Solutions`,
      description: `Estimate your solar savings and ESS payback period. Philippine utility rates, real Neovolt system sizing, 25-year ROI.`,
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
  };
}

export default async function CalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('calculator');

  return (
    <>
      <Navbar />
      <main className="bg-background-50 min-h-screen pt-24">
        <AnimatedSection className="max-w-4xl mx-auto px-6 text-center mb-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground-950 mb-4">{t('pageTitle')}</h1>
          <p className="text-foreground-600">{t('pageSubtitle')}</p>
        </AnimatedSection>
        <Calculator />
      </main>
      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </>
  );
}
