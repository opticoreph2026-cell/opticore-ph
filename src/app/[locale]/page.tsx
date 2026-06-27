import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { Hero3D } from '@/components/landing/Hero3D';
import { TrustBar } from '@/components/landing/TrustBar';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Calculator } from '@/components/landing/Calculator';
import { Features } from '@/components/landing/Features';
import { TerritoryCards } from '@/components/landing/TerritoryCards';
import { WhatsAppButton } from '@/components/landing/WhatsAppButton';
import { ScrollToTop } from '@/components/landing/ScrollToTop';
import { SmoothScroll } from '@/components/landing/SmoothScroll';
import { CursorFollower } from '@/components/landing/CursorFollower';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'OptiCore Energy Solutions',
  image: '/og-image.png',
  email: 'engineering@opticore.ph',
  telephone: '+639504692442',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Cebu City',
    addressRegion: 'Cebu',
    addressCountry: 'PH',
  },
  areaServed: ['Cebu', 'Bohol', 'Leyte'],
  url: 'https://opticore-ph.vercel.app',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SmoothScroll>
        <Navbar />
        <main className="min-h-screen">
          <Hero3D />
          <TrustBar />
          <HowItWorks />
          <Calculator />
          <Features />
          <TerritoryCards />
        </main>
        <Footer />
        <WhatsAppButton />
        <ScrollToTop />
        <CursorFollower />
      </SmoothScroll>
    </>
  );
}
