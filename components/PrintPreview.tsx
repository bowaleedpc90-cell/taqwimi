'use client';

import { useEffect, useMemo, useState } from 'react';
import { AR_MONTHS } from '@/lib/constants';
import { parseYMD, shiftMonth } from '@/lib/dateUtils';
import { buildPrintMonth, buildPrintYear } from '@/lib/printTemplateEngine';
import { useApp } from './AppStateProvider';
import { useToday } from '@/hooks/useToday';
import { PrintMonth } from './PrintMonth';

type Scope = 'month' | 'year';

export function PrintPreview() {
  const { state, hydrated } = useApp();
  const today = useToday();
  const [scope, setScope] = useState<Scope>('month');
  const [ym, setYm] = useState<{ y: number; m: number } | null>(null);
  const [ready, setReady] = useState(false);

  // تهيئة من معاملات الرابط أو الشهر الحالي
  useEffect(() => {
    if (ready) return;
    const p = new URLSearchParams(window.location.search);
    const qScope = p.get('scope');
    const qy = Number(p.get('y'));
    const qm = Number(p.get('m'));
    if (qScope === 'year' || qScope === 'month') setScope(qScope);
    if (qy >= 1970) {
      setYm({ y: qy, m: qm >= 1 && qm <= 12 ? qm : 1 });
      setReady(true);
    } else if (today) {
      setYm(parseYMD(today));
      setReady(true);
    }
  }, [today, ready]);

  const pages = useMemo(() => {
    if (!ym) return [];
    return scope === 'year' ? buildPrintYear(state, ym.y) : [buildPrintMonth(state, ym.y, ym.m)];
  }, [scope, ym, state]);

  if (!hydrated || !ym) {
    return <div className="h-[60dvh] animate-pulse rounded-xl2 bg-navy-50/60" />;
  }

  return (
    <div>
      {/* أدوات التحكم — لا تُطبع */}
      <div className="no-print mb-4">
        <h1 className="mb-3 flex items-center gap-2 text-xl font-extrabold text-navy">
          <span aria-hidden>🖨️</span> معاينة الطباعة
        </h1>

        <div className="mb-3 inline-flex w-full rounded-full bg-navy-50 p-1 text-sm font-bold">
          <button
            type="button"
            onClick={() => setScope('month')}
            className={`flex-1 rounded-full px-4 py-2 transition ${scope === 'month' ? 'bg-surface text-navy shadow-sm' : 'text-muted'}`}
          >
            الشهر المختار
          </button>
          <button
            type="button"
            onClick={() => setScope('year')}
            className={`flex-1 rounded-full px-4 py-2 transition ${scope === 'year' ? 'bg-surface text-navy shadow-sm' : 'text-muted'}`}
          >
            السنة كاملة (12 صفحة)
          </button>
        </div>

        <div className="mb-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() =>
              setYm((p) => (p ? (scope === 'year' ? { ...p, y: p.y - 1 } : shiftMonth(p.y, p.m, -1)) : p))
            }
            className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-50 text-navy"
            aria-label="السابق"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
          </button>
          <div className="num text-lg font-extrabold text-navy">
            {scope === 'year' ? ym.y : `${AR_MONTHS[ym.m - 1]} ${ym.y}`}
          </div>
          <button
            type="button"
            onClick={() =>
              setYm((p) => (p ? (scope === 'year' ? { ...p, y: p.y + 1 } : shiftMonth(p.y, p.m, 1)) : p))
            }
            className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-50 text-navy"
            aria-label="التالي"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
        </div>

        <button type="button" onClick={() => window.print()} className="btn btn-primary w-full">
          🖨️ طباعة الآن
        </button>
        <p className="mt-2 text-center text-xs text-muted">
          فعّل «طباعة الخلفيات/الألوان» في نافذة الطباعة لظهور ألوان العطل.
        </p>
      </div>

      {/* المحتوى المطبوع */}
      <div className="print-root">
        {pages.map((vm) => (
          <PrintMonth key={`${vm.year}-${vm.month}`} vm={vm} />
        ))}
      </div>
    </div>
  );
}
