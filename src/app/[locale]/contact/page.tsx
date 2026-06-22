import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { ContactForm } from '@/components/landing/ContactForm';
import { Mail, Phone, Clock } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });
  return { title: `${t('title')} | OptiCore Energy Solutions` };
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
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">{t('title')}</h1>
            <p className="text-gray-400 max-w-xl mx-auto">{t('subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 glass-panel rounded-3xl p-8">
              <ContactForm />
            </div>

            <div className="space-y-6">
              <div className="glass-panel rounded-2xl p-6">
                <Phone className="w-5 h-5 text-accent-cyan mb-3" />
                <p className="text-xs text-white/40 uppercase tracking-widest mb-1">{t('info.phone')}</p>
                <a href="tel:+639171234567" className="text-white hover:text-accent-cyan transition-colors">
                  +63 917 123 4567
                </a>
              </div>
              <div className="glass-panel rounded-2xl p-6">
                <Mail className="w-5 h-5 text-accent-cyan mb-3" />
                <p className="text-xs text-white/40 uppercase tracking-widest mb-1">{t('info.email')}</p>
                <a
                  href="mailto:engineering@opticore.ph"
                  className="text-white hover:text-accent-cyan transition-colors"
                >
                  engineering@opticore.ph
                </a>
              </div>
              <div className="glass-panel rounded-2xl p-6">
                <Clock className="w-5 h-5 text-accent-cyan mb-3" />
                <p className="text-xs text-white/40 uppercase tracking-widest mb-1">{t('info.hours')}</p>
                <p className="text-white/80">{t('info.hoursValue')}</p>
              </div>
              <div className="rounded-2xl border border-[#F5A524]/20 bg-[#F5A524]/5 p-6">
                <p className="text-sm font-semibold text-[#F5A524] mb-1">Julius Rey S. Gisto, RME</p>
                <p className="text-xs text-white/50">Registered Master Electrician · PRC Licensed</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
