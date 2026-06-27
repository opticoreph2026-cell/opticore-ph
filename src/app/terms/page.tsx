import { getTranslations } from 'next-intl/server';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { WhatsAppButton } from '@/components/landing/WhatsAppButton';
import { ScrollToTop } from '@/components/landing/ScrollToTop';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export const metadata = {
  title: 'Terms of Service | OptiCore Energy Solutions',
  description: 'Terms and conditions governing the use of OptiCore Energy Solutions platform and services.',
};

export default async function TermsPage() {
  const t = await getTranslations('terms');

  const sections = [
    { key: 'services', contentKeys: ['p1', 'p2', 'p3'] },
    { key: 'assessments', contentKeys: ['p1', 'p2', 'p3'] },
    { key: 'calculator', contentKeys: ['p1', 'p2', 'p3', 'p4'] },
    { key: 'warranties', contentKeys: ['p1', 'p2', 'p3'] },
    { key: 'intellectualProperty', contentKeys: ['p1', 'p2'] },
    { key: 'liability', contentKeys: ['p1', 'p2', 'p3'] },
    { key: 'governingLaw', contentKeys: ['p1'] },
    { key: 'changes', contentKeys: ['p1'] },
    { key: 'contact', contentKeys: ['p1'] },
  ];

  return (
    <>
      <Navbar />
      <main className="bg-background-50 min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground-950 mb-4">{t('title')}</h1>
            <p className="text-sm text-foreground-500">{t('lastUpdated')}</p>
          </AnimatedSection>

          {sections.map((section, i) => (
            <AnimatedSection key={section.key} className="glass-panel rounded-3xl p-8 md:p-12 mb-8" delay={0.1 * i}>
              <h2 className="text-xl font-display font-bold text-foreground-950 mb-4">{t(`${section.key}.heading`)}</h2>
              <div className="space-y-3">
                {section.contentKeys.map((ck) => (
                  <p key={ck} className="text-foreground-600 leading-relaxed text-sm">{t(`${section.key}.${ck}`)}</p>
                ))}
              </div>
            </AnimatedSection>
          ))}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </>
  );
}
