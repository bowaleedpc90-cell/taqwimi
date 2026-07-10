'use client';

import { useLang, useT } from './LanguageProvider';
import type { Lang } from '@/lib/types';

function Chevron({ dir, lang }: { dir: 'prev' | 'next'; lang: Lang }) {
  // في RTL: السابق = سهم يمين (رجوع)، التالي = سهم يسار (تقدّم)
  // في LTR (الإنجليزية): السابق = سهم يسار، التالي = سهم يمين
  const pointRight = 'M9 5l7 7-7 7';
  const pointLeft = 'M15 5l-7 7 7 7';
  const rtl = lang === 'ar';
  const d = dir === 'prev' ? (rtl ? pointRight : pointLeft) : rtl ? pointLeft : pointRight;
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export function MonthNav({
  title,
  hijri,
  onPrev,
  onNext,
  onToday,
}: {
  title: string;
  hijri?: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}) {
  const { lang } = useLang();
  const t = useT();
  return (
    <div className="mb-3 flex select-none items-center justify-between gap-2">
      <button
        type="button"
        onClick={onPrev}
        aria-label={t('الشهر السابق')}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-subtle text-heading transition active:scale-95"
      >
        <Chevron dir="prev" lang={lang} />
      </button>

      <div className="flex flex-col items-center">
        <div className="text-lg font-extrabold text-heading">{title}</div>
        {hijri && (
          <div className="mt-0.5 text-xs font-semibold text-religious">
            {hijri} {t('هـ')}
          </div>
        )}
        <button
          type="button"
          onClick={onToday}
          className="mt-1 rounded-full bg-gold-soft px-4 py-1 text-xs font-bold text-gold transition active:scale-95"
        >
          {t('اليوم')}
        </button>
      </div>

      <button
        type="button"
        onClick={onNext}
        aria-label={t('الشهر التالي')}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-subtle text-heading transition active:scale-95"
      >
        <Chevron dir="next" lang={lang} />
      </button>
    </div>
  );
}
