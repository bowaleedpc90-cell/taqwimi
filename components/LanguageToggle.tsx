'use client';

import { useEffect, useState } from 'react';
import { useLang } from './LanguageProvider';

/** مبدّل اللغة (ع | EN) — العربية الأساسية، الإنجليزية اختيارية. */
export function LanguageToggle({ className = '' }: { className?: string }) {
  const { lang, setLang, t } = useLang();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // قبل mount نعرض العربية (الافتراضي) لتجنّب عدم تطابق الترطيب
  const active: 'ar' | 'en' = mounted ? lang : 'ar';

  return (
    <div className="inline-flex overflow-hidden rounded-full bg-subtle p-1 text-xs font-bold" role="group" aria-label={t('اللغة')}>
      <button
        type="button"
        onClick={() => setLang('ar')}
        aria-pressed={active === 'ar'}
        className={`rounded-full px-2.5 py-1 transition ${active === 'ar' ? 'bg-surface text-heading shadow-sm' : 'text-muted'}`}
      >
        ع
      </button>
      <button
        type="button"
        onClick={() => setLang('en')}
        aria-pressed={active === 'en'}
        className={`rounded-full px-2.5 py-1 transition ${active === 'en' ? 'bg-surface text-heading shadow-sm' : 'text-muted'}`}
      >
        EN
      </button>
    </div>
  );
}
