'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { clampYear, MIN_YEAR, parseYMD } from '@/lib/dateUtils';
import { effectiveHolidayMap } from '@/lib/kuwaitHolidayService';
import type { Holiday } from '@/lib/types';
import { useApp } from './AppStateProvider';
import { useToday } from '@/hooks/useToday';
import { useLang } from './LanguageProvider';
import { ViewToggle } from './ViewToggle';
import { MiniMonth } from './MiniMonth';

export function YearView() {
  const { state, hydrated } = useApp();
  const today = useToday();
  const { lang, t } = useLang();
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    if (today && year === null) setYear(parseYMD(today).y);
  }, [today, year]);

  const itemDates = useMemo(() => new Set(state.items.map((i) => i.date)), [state.items]);
  const holidays = useMemo(
    () => (year === null ? new Map<string, Holiday>() : effectiveHolidayMap(year, state)),
    [year, state],
  );

  if (!hydrated || year === null) {
    return <div className="h-[70dvh] animate-pulse rounded-xl2 bg-subtle/60" />;
  }

  return (
    <div>
      <ViewToggle active="year" />

      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setYear((y) => clampYear((y ?? MIN_YEAR) - 1))}
          aria-label={t('السنة السابقة')}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-subtle text-heading active:scale-95"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d={lang === 'en' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} /></svg>
        </button>
        <div className="flex flex-col items-center">
          <div className="num text-xl font-extrabold text-heading">{year}</div>
          {today && parseYMD(today).y !== year && (
            <button
              type="button"
              onClick={() => setYear(parseYMD(today).y)}
              className="mt-0.5 rounded-full bg-gold-soft px-3 py-0.5 text-xs font-bold text-gold"
            >
              {t('السنة الحالية')}
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setYear((y) => clampYear((y ?? MIN_YEAR) + 1))}
          aria-label={t('السنة التالية')}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-subtle text-heading active:scale-95"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d={lang === 'en' ? 'M9 5l7 7-7 7' : 'M15 5l-7 7 7 7'} /></svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
          <MiniMonth
            key={m}
            year={year}
            month={m}
            settings={state.settings}
            todayISO={today}
            dayNotes={state.dayNotes}
            itemDates={itemDates}
            holidays={holidays}
            lang={lang}
          />
        ))}
      </div>

      <Link
        href={{ pathname: '/print', query: { scope: 'year', y: year } }}
        className="btn btn-gold mt-4 w-full"
      >
        🖨️ {t('طباعة السنة كاملة ({n})', { n: year })}
      </Link>
    </div>
  );
}
