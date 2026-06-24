'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { Globe } from 'lucide-react';

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const otherLocale = locale === 'en' ? 'fil' : 'en';

  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, { locale: otherLocale })}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/60 hover:text-white rounded-lg hover:bg-white/5 border border-white/10 transition-all"
      aria-label={`Switch language to ${otherLocale === 'fil' ? 'Filipino' : 'English'}`}
    >
      <Globe className="w-3.5 h-3.5" />
      <span>{locale === 'en' ? 'Filipino' : 'English'}</span>
    </button>
  );
}
