import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { Award, MapPin, Target } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });
  return { title: `${t('title')} | OptiCore Energy Solutions` };
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
      <main className="bg-[#08080B] text-white min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">{t('title')}</h1>
            <p className="text-gray-400">{t('subtitle')}</p>
          </div>

          <div className="glass-panel rounded-3xl p-8 md:p-12 mb-10">
            <div className="flex items-start gap-4 mb-6">
              <Award className="w-8 h-8 text-[#F5A524] flex-shrink-0" />
              <div>
                <p className="text-sm text-accent-amber uppercase tracking-widest mb-1">
                  {t('founderTitle')}
                </p>
                <h2 className="text-2xl font-display font-bold mb-3">{t('founderName')}</h2>
                <p className="text-gray-400 leading-relaxed">{t('founderBio')}</p>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-8 md:p-12 mb-10">
            <div className="flex items-start gap-4">
              <Target className="w-8 h-8 text-accent-cyan flex-shrink-0" />
              <div>
                <h2 className="text-xl font-display font-bold mb-3">{t('missionTitle')}</h2>
                <p className="text-gray-400 leading-relaxed">{t('mission')}</p>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-8 md:p-12 mb-10">
            <div className="flex items-start gap-4">
              <MapPin className="w-8 h-8 text-accent-emerald flex-shrink-0" />
              <div>
                <h2 className="text-xl font-display font-bold mb-4">{t('territories')}</h2>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent-cyan" />
                    {t('territoryCebu')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent-emerald" />
                    {t('territoryBohol')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent-amber" />
                    {t('territoryLeyte')}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/contact"
              className="inline-block px-8 py-3 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition-colors"
            >
              Book a Free Site Visit
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
