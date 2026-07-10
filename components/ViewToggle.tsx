'use client';

import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { useT } from './LanguageProvider';

export function ViewToggle({ active }: { active: 'month' | 'year' }) {
  const t = useT();
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      {/* اسم التطبيق «تقويمي» ثابت لا يُترجم */}
      <div className="flex items-center gap-2 text-xl font-extrabold text-heading">
        <span aria-hidden>🗓️</span>
        تقويمي
      </div>
      <div className="flex items-center gap-1.5">
        <div className="inline-flex rounded-full bg-subtle p-1 text-sm font-bold">
          <Link
            href="/"
            className={`rounded-full px-3.5 py-1.5 transition ${
              active === 'month' ? 'bg-surface text-heading shadow-sm' : 'text-muted'
            }`}
          >
            {t('شهري')}
          </Link>
          <Link
            href="/year"
            className={`rounded-full px-3.5 py-1.5 transition ${
              active === 'year' ? 'bg-surface text-heading shadow-sm' : 'text-muted'
            }`}
          >
            {t('السنة')}
          </Link>
        </div>
        <LanguageToggle />
        <ThemeToggle />
      </div>
    </div>
  );
}
