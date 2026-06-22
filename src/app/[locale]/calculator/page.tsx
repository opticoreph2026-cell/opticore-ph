import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { Calculator } from '@/components/landing/Calculator';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'calculator' });
  return { title: `${t('pageTitle')} | OptiCore Energy Solutions` };
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
      <main className="bg-[#08080B] text-white min-h-screen pt-24">
        <div className="max-w-4xl mx-auto px-6 text-center mb-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">{t('pageTitle')}</h1>
          <p className="text-gray-400">{t('pageSubtitle')}</p>
        </div>
        <Calculator />
      </main>
      <Footer />
    </>
  );
}
