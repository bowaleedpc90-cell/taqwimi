'use client';

import { useEffect, useMemo, useState } from 'react';
import { parseYMD, shiftMonth } from '@/lib/dateUtils';
import { monthNames } from '@/lib/i18n';
import { buildPrintMonth, buildPrintYear } from '@/lib/printTemplateEngine';
import { useApp } from './AppStateProvider';
import { useLang } from './LanguageProvider';
import { useToday } from '@/hooks/useToday';
import { PrintMonth } from './PrintMonth';

type Scope = 'month' | 'year';
type Paper = 'A4' | 'A3';
type Orientation = 'portrait' | 'landscape';

// ارتفاع منطقة المحتوى (مم). نطرح هوامش الطباعة (10مم علوي+سفلي = 20) إضافةً إلى
// احتياطي ~26مم لترويسة/تذييل المتصفح التلقائي (خصوصًا iOS Safari الذي يضيف الرابط
// والتاريخ ورقم الصفحة) كي لا يطفح الشهر إلى صفحة ثانية.
function pageContentMm(paper: Paper, orientation: Orientation): number {
  const dims: Record<Paper, [number, number]> = { A4: [210, 297], A3: [297, 420] };
  const [w, h] = dims[paper];
  return (orientation === 'portrait' ? h : w) - 46;
}

function SegButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-full px-3 py-2 text-sm font-bold transition ${active ? 'bg-surface text-heading shadow-sm' : 'text-muted'}`}
    >
      {children}
    </button>
  );
}

export function PrintPreview() {
  const { state, hydrated } = useApp();
  const { lang, t } = useLang();
  const today = useToday();
  const [scope, setScope] = useState<Scope>('month');
  const [paper, setPaper] = useState<Paper>('A4');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [ym, setYm] = useState<{ y: number; m: number } | null>(null);
  const [ready, setReady] = useState(false);

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
    return scope === 'year' ? buildPrintYear(state, ym.y, lang) : [buildPrintMonth(state, ym.y, ym.m, lang)];
  }, [scope, ym, state, lang]);

  // أسهم التنقّل تتبع اللغة: في الإنجليزية (LTR) السابق يسار والتالي يمين.
  const prevPath = lang === 'en' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7';
  const nextPath = lang === 'en' ? 'M9 5l7 7-7 7' : 'M15 5l-7 7 7 7';

  const pageCss = useMemo(
    () =>
      `@page{size:${paper} ${orientation};margin:10mm}` +
      `@media print{.print-page{height:${pageContentMm(paper, orientation)}mm}}`,
    [paper, orientation],
  );

  if (!hydrated || !ym) {
    return <div className="h-[60dvh] animate-pulse rounded-xl2 bg-subtle/60" />;
  }

  return (
    <div>
      {/* حقن حجم الصفحة واتجاهها للطباعة */}
      <style dangerouslySetInnerHTML={{ __html: pageCss }} />

      {/* أدوات التحكم — لا تُطبع */}
      <div className="no-print mb-4">
        <h1 className="mb-3 flex items-center gap-2 text-xl font-extrabold text-heading">
          <span aria-hidden>🖨️</span> {t('إعدادات الطباعة')}
        </h1>

        <div className="mb-3 inline-flex w-full rounded-full bg-subtle p-1">
          <SegButton active={scope === 'month'} onClick={() => setScope('month')}>{t('الشهر المختار')}</SegButton>
          <SegButton active={scope === 'year'} onClick={() => setScope('year')}>{t('السنة كاملة (١٢ صفحة)')}</SegButton>
        </div>

        {/* التنقّل */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setYm((p) => (p ? (scope === 'year' ? { ...p, y: p.y - 1 } : shiftMonth(p.y, p.m, -1)) : p))}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-subtle text-heading"
            aria-label={t('السابق')}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d={prevPath} /></svg>
          </button>
          <div className="num text-lg font-extrabold text-heading">
            {scope === 'year' ? ym.y : `${monthNames(lang)[ym.m - 1]} ${ym.y}`}
          </div>
          <button
            type="button"
            onClick={() => setYm((p) => (p ? (scope === 'year' ? { ...p, y: p.y + 1 } : shiftMonth(p.y, p.m, 1)) : p))}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-subtle text-heading"
            aria-label={t('التالي')}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d={nextPath} /></svg>
          </button>
        </div>

        {/* حجم الورق + الاتجاه */}
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div>
            <div className="mb-1 text-xs font-bold text-muted">{t('حجم الورق')}</div>
            <div className="inline-flex w-full rounded-full bg-subtle p-1">
              <SegButton active={paper === 'A4'} onClick={() => setPaper('A4')}>A4</SegButton>
              <SegButton active={paper === 'A3'} onClick={() => setPaper('A3')}>A3</SegButton>
            </div>
          </div>
          <div>
            <div className="mb-1 text-xs font-bold text-muted">{t('الاتجاه')}</div>
            <div className="inline-flex w-full rounded-full bg-subtle p-1">
              <SegButton active={orientation === 'portrait'} onClick={() => setOrientation('portrait')}>{t('عمودي')}</SegButton>
              <SegButton active={orientation === 'landscape'} onClick={() => setOrientation('landscape')}>{t('أفقي')}</SegButton>
            </div>
          </div>
        </div>

        <button type="button" onClick={() => window.print()} className="btn btn-primary w-full">
          🖨️ {t('طباعة الآن')}
        </button>
        <p className="mt-2 text-center text-xs text-muted">
          {t('فعّل «طباعة الخلفيات/الألوان» (Background graphics) في نافذة الطباعة لظهور ألوان العطل.')}
        </p>
      </div>

      {/* المحتوى المطبوع */}
      <div className="print-root mx-auto max-w-[520px]">
        {pages.map((vm) => (
          <PrintMonth key={`${vm.year}-${vm.month}`} vm={vm} />
        ))}
      </div>
    </div>
  );
}
