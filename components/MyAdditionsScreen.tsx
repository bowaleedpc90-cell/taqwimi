'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/constants';
import { compareISO, parseYMD } from '@/lib/dateUtils';
import { categoryLabel, monthNames } from '@/lib/i18n';
import type { Lang } from '@/lib/types';
import { useApp } from './AppStateProvider';
import { useLang } from './LanguageProvider';

function shortDate(iso: string, lang: Lang): string {
  const { y, m, d } = parseYMD(iso);
  return `${d} ${monthNames(lang)[m - 1]} ${y}`;
}

function monthLabel(mk: string, lang: Lang): string {
  const [y, m] = mk.split('-').map(Number);
  return `${monthNames(lang)[m - 1]} ${y}`;
}

function dayLink(iso: string) {
  const { y, m } = parseYMD(iso);
  return { pathname: '/', query: { y, m } };
}

export function MyAdditionsScreen() {
  const { state, hydrated, update } = useApp();
  const { lang, t } = useLang();

  const items = useMemo(
    () => [...state.items].sort((a, b) => compareISO(a.date, b.date) || a.createdAt - b.createdAt),
    [state.items],
  );
  const notes = useMemo(
    () => Object.entries(state.dayNotes).sort((a, b) => compareISO(a[0], b[0])),
    [state.dayNotes],
  );
  const generalNotes = useMemo(
    () => Object.entries(state.generalNotes).sort((a, b) => compareISO(a[0], b[0])),
    [state.generalNotes],
  );

  if (!hydrated) return <div className="h-[50dvh] animate-pulse rounded-xl2 bg-subtle/60" />;

  const empty = items.length === 0 && notes.length === 0 && generalNotes.length === 0;

  return (
    <div>
      <h1 className="mb-4 flex items-center gap-2 text-xl font-extrabold text-heading">
        <span aria-hidden>📋</span> {t('إضافاتي')}
      </h1>

      {empty && (
        <div className="card p-6 text-center">
          <div className="mb-2 text-4xl">🗓️</div>
          <p className="mb-4 text-muted">{t('ما أضفت شي بعد. افتح الرزنامة واضغط على أي يوم لإضافة مناسبة أو نوتة.')}</p>
          <Link href="/" className="btn btn-primary w-full">
            {t('افتح الرزنامة')}
          </Link>
        </div>
      )}

      {items.length > 0 && (
        <section className="mb-4">
          <h2 className="mb-2 text-sm font-bold text-muted">{t('المناسبات والإضافات ({n})', { n: items.length })}</h2>
          <ul className="flex flex-col gap-2">
            {items.map((it) => (
              <li key={it.id} className="card flex items-center gap-3 p-3">
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded-full"
                  style={{ background: it.color || CATEGORIES[it.category].color }}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-ink">
                    <span className="me-1" aria-hidden>{CATEGORIES[it.category].emoji}</span>
                    {it.title}
                  </div>
                  <div className="text-xs text-muted">
                    {shortDate(it.date, lang)} · {categoryLabel(lang, it.category)}
                  </div>
                </div>
                <Link href={dayLink(it.date)} className="rounded-lg bg-subtle px-2.5 py-1.5 text-xs font-bold text-heading">
                  {t('افتح')}
                </Link>
                <button
                  type="button"
                  onClick={() => update((s) => ({ ...s, items: s.items.filter((x) => x.id !== it.id) }))}
                  className="rounded-lg bg-danger-soft px-2.5 py-1.5 text-xs font-bold text-danger"
                >
                  {t('حذف')}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {notes.length > 0 && (
        <section className="mb-4">
          <h2 className="mb-2 text-sm font-bold text-muted">{t('نوتات الأيام ({n})', { n: notes.length })}</h2>
          <ul className="flex flex-col gap-2">
            {notes.map(([iso, text]) => (
              <li key={iso} className="card flex items-center gap-3 p-3">
                <span aria-hidden>📝</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-ink">{text}</div>
                  <div className="text-xs text-muted">{shortDate(iso, lang)}</div>
                </div>
                <Link href={dayLink(iso)} className="rounded-lg bg-subtle px-2.5 py-1.5 text-xs font-bold text-heading">
                  {t('افتح')}
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    update((s) => {
                      const next = { ...s.dayNotes };
                      delete next[iso];
                      return { ...s, dayNotes: next };
                    })
                  }
                  className="rounded-lg bg-danger-soft px-2.5 py-1.5 text-xs font-bold text-danger"
                >
                  {t('حذف')}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {generalNotes.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-bold text-muted">{t('ملاحظات الأشهر ({n})', { n: generalNotes.length })}</h2>
          <ul className="flex flex-col gap-2">
            {generalNotes.map(([mk, text]) => (
              <li key={mk} className="card flex items-center gap-3 p-3">
                <span aria-hidden>📌</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-ink">{text}</div>
                  <div className="text-xs text-muted">{monthLabel(mk, lang)}</div>
                </div>
                <Link
                  href={{ pathname: '/', query: { y: Number(mk.split('-')[0]), m: Number(mk.split('-')[1]) } }}
                  className="rounded-lg bg-subtle px-2.5 py-1.5 text-xs font-bold text-heading"
                >
                  {t('افتح')}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
