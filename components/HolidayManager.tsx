'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { HOLIDAY_TYPE_TINT } from '@/lib/constants';
import { dayOfWeek, parseYMD, ymd } from '@/lib/dateUtils';
import { getBuiltInHolidaysForYear } from '@/lib/kuwaitHolidayService';
import { confirmHoliday, deleteBuiltInHoliday, deleteCustomHoliday, restoreHoliday, restoreYearDefaults } from '@/lib/holidayActions';
import type { Holiday, Lang } from '@/lib/types';
import { useApp } from './AppStateProvider';
import { useToday } from '@/hooks/useToday';
import { useLang } from './LanguageProvider';
import { monthNames, weekdayNames, holidayTypeLabel, holidayName } from '@/lib/i18n';
import { HolidayEditSheets, builtinEditingFor, type HolidayEditing } from './HolidayEditSheets';
import { EstimatedBadge } from './EstimatedBadge';

function longDate(iso: string, lang: Lang): string {
  const { y, m, d } = parseYMD(iso);
  const sep = lang === 'en' ? ', ' : '، ';
  return `${weekdayNames(lang)[dayOfWeek(y, m, d)]}${sep}${d} ${monthNames(lang)[m - 1]} ${y}`;
}

interface Row {
  key: string;
  effective: Holiday;
  kind: 'builtin' | 'custom';
  slug?: string;
  id?: string;
  deleted: boolean;
  edited: boolean;
}

export function HolidayManager() {
  const { state, hydrated, update } = useApp();
  const { lang, t } = useLang();
  const today = useToday();
  const [year, setYear] = useState<number | null>(null);
  const [editing, setEditing] = useState<HolidayEditing>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const y = year ?? (today ? parseYMD(today).y : 2026);

  const rows = useMemo<Row[]>(() => {
    const overrides = state.holidayOverrides ?? {};
    const out: Row[] = [];

    for (const h of getBuiltInHolidaysForYear(y)) {
      const ov = h.slug ? overrides[`${y}-${h.slug}`] : undefined;
      const deleted = !!ov?.deleted;
      const effective: Holiday = {
        ...h,
        gregorianDate: ov?.gregorianDate ?? h.gregorianDate,
        nameAr: ov?.nameAr ?? h.nameAr,
        type: ov?.type ?? h.type,
        isEstimated: ov?.confirmed ? false : h.isEstimated,
      };
      const edited = !!ov && !deleted && !!(ov.gregorianDate || ov.nameAr || ov.type || ov.confirmed);
      out.push({ key: `b-${h.slug}`, effective, kind: 'builtin', slug: h.slug, deleted, edited });
    }

    for (const c of state.customHolidays ?? []) {
      if (c.gregorianDate.startsWith(`${y}-`)) {
        out.push({ key: `c-${c.id}`, effective: c, kind: 'custom', id: c.id, deleted: false, edited: false });
      }
    }

    return out.sort((a, b) => a.effective.gregorianDate.localeCompare(b.effective.gregorianDate));
  }, [state.holidayOverrides, state.customHolidays, y]);

  if (!hydrated) return <div className="h-[60dvh] animate-pulse rounded-xl2 bg-subtle/60" />;

  const defaultAddDate = today && parseYMD(today).y === y ? today : ymd(y, 1, 1);

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Link href="/settings" aria-label={t('رجوع')} className="flex h-11 w-11 items-center justify-center rounded-full bg-subtle text-heading">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d={lang === 'en' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} /></svg>
        </Link>
        <h1 className="flex items-center gap-2 text-xl font-extrabold text-heading">
          <span aria-hidden>📅</span> {t('إدارة العطل والمناسبات')}
        </h1>
      </div>

      <p className="mb-3 rounded-xl border border-line bg-canvas px-3 py-2 text-xs leading-relaxed text-muted">
        {t('العطل بالكويت تتغيّر حسب قرارات الحكومة ورؤية الهلال. تقدر تعدّل تاريخ أي عطلة أو تحذفها أو تضيف مناسبة جديدة — وكل تغيير يُحفظ على جهازك وينعكس في الرزنامة والطباعة. المناسبات المستقبلية تظهر بشارة «تقديري» حتى تثبّتها.')}
      </p>

      <div className="mb-3 flex items-center justify-between gap-2">
        <button type="button" onClick={() => setYear(y - 1)} aria-label={t('السنة السابقة')} className="flex h-11 w-11 items-center justify-center rounded-full bg-subtle text-heading active:scale-95">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d={lang === 'en' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} /></svg>
        </button>
        <div className="num text-lg font-extrabold text-heading">{y}</div>
        <button type="button" onClick={() => setYear(y + 1)} aria-label={t('السنة التالية')} className="flex h-11 w-11 items-center justify-center rounded-full bg-subtle text-heading active:scale-95">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d={lang === 'en' ? 'M9 5l7 7-7 7' : 'M15 5l-7 7 7 7'} /></svg>
        </button>
      </div>

      <button type="button" onClick={() => setEditing({ mode: 'add', date: defaultAddDate })} className="btn btn-primary mb-3 w-full">
        ＋ {t('إضافة عطلة / مناسبة')}
      </button>

      <ul className="flex flex-col gap-2">
        {rows.map((r) => (
          <li key={r.key} className={`card flex items-center gap-3 p-3 ${r.deleted ? 'opacity-60' : ''}`}>
            <button
              type="button"
              onClick={() =>
                r.kind === 'builtin'
                  ? setEditing(builtinEditingFor(y, r.slug!, state))
                  : setEditing({ mode: 'custom', id: r.id!, value: { nameAr: r.effective.nameAr, gregorianDate: r.effective.gregorianDate, type: r.effective.type } })
              }
              className="min-w-0 flex-1 text-start"
            >
              <div className="flex items-center gap-2">
                <span className={`truncate font-bold text-ink ${r.deleted ? 'line-through' : ''}`}>{holidayName(lang, r.effective)}</span>
                {r.effective.isEstimated && !r.deleted && <EstimatedBadge />}
                {r.edited && <span className="rounded bg-gold-soft px-1 text-[9px] font-bold text-gold">{t('معدّلة')}</span>}
                {r.deleted && <span className="rounded bg-danger-soft px-1 text-[9px] font-bold text-danger">{t('محذوفة')}</span>}
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${HOLIDAY_TYPE_TINT[r.effective.type]}`}>{holidayTypeLabel(lang, r.effective.type)}</span>
                <span className="num">{longDate(r.effective.gregorianDate, lang)}</span>
              </div>
            </button>

            {r.kind === 'builtin' && r.effective.isEstimated && !r.deleted && (
              <button type="button" onClick={() => update((s) => confirmHoliday(s, y, r.slug!))} className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-lg bg-national-soft px-3 text-xs font-bold text-national">
                {t('تثبيت')}
              </button>
            )}
            {r.deleted ? (
              <button type="button" onClick={() => update((s) => restoreHoliday(s, y, r.slug!))} className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-lg bg-subtle px-3 text-xs font-bold text-heading">
                {t('استعادة')}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => (r.kind === 'builtin' ? update((s) => deleteBuiltInHoliday(s, y, r.slug!)) : update((s) => deleteCustomHoliday(s, r.id!)))}
                aria-label={t('حذف')}
                className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-lg bg-danger-soft px-3 text-xs font-bold text-danger"
              >
                {t('حذف')}
              </button>
            )}
          </li>
        ))}
      </ul>

      <section className="card mt-4 p-4">
        <div className="mb-1 font-bold text-heading">{t('استعادة العطل الرسمية')}</div>
        <p className="mb-3 text-xs text-muted">
          {t('يرجّع كل العطل الرسمية لسنة {n} لتواريخها الافتراضية ويلغي تعديلاتك عليها. لا يمسّ المناسبات التي أضفتها بنفسك.', { n: y })}
        </p>
        {!confirmReset ? (
          <button type="button" onClick={() => setConfirmReset(true)} className="btn btn-ghost w-full">
            {t('استعادة عطل {n} الافتراضية', { n: y })}
          </button>
        ) : (
          <div className="flex gap-2">
            <button type="button" onClick={() => { update((s) => restoreYearDefaults(s, y)); setConfirmReset(false); }} className="btn btn-danger flex-1">
              {t('تأكيد الاستعادة')}
            </button>
            <button type="button" onClick={() => setConfirmReset(false)} className="btn btn-ghost flex-1">
              {t('إلغاء')}
            </button>
          </div>
        )}
      </section>

      <HolidayEditSheets year={y} editing={editing} onClose={() => setEditing(null)} />
    </div>
  );
}
