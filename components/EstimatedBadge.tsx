'use client';

import { useT } from './LanguageProvider';

export function EstimatedBadge({ className = '' }: { className?: string }) {
  const t = useT();
  return (
    <span
      className={`inline-block rounded bg-religious/15 px-1 text-[9px] font-bold leading-tight text-religious ${className}`}
    >
      {t('تقديري')}
    </span>
  );
}
