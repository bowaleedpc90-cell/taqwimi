'use client';

import { useState } from 'react';
import Link from 'next/link';
import { defaultState } from '@/lib/storage';
import { useApp } from './AppStateProvider';
import { useTheme } from './ThemeProvider';
import { ToggleRow } from './ToggleRow';
import { BrandFooter } from './BrandFooter';

export function SettingsScreen() {
  const { state, hydrated, update } = useApp();
  const { theme, toggle } = useTheme();
  const [confirmReset, setConfirmReset] = useState(false);

  if (!hydrated) {
    return <div className="h-[50dvh] animate-pulse rounded-xl2 bg-subtle/60" />;
  }

  const s = state.settings;
  const set = (patch: Partial<typeof s>) => update((st) => ({ ...st, settings: { ...st.settings, ...patch } }));

  return (
    <div>
      <h1 className="mb-4 flex items-center gap-2 text-xl font-extrabold text-heading">
        <span aria-hidden>⚙️</span> الإعدادات
      </h1>

      <section className="card mb-3 px-4 py-1">
        <ToggleRow
          label="الوضع الليلي"
          description="مظهر داكن مريح للعين — يُحفظ على جهازك"
          checked={theme === 'dark'}
          onChange={() => toggle()}
        />
      </section>

      <section className="card mb-3 px-4 py-1 divide-y divide-line">
        <ToggleRow
          label="العطل الرسمية"
          description="عرض العطل الوطنية والحكومية على الرزنامة"
          checked={s.showHolidays}
          onChange={(v) => set({ showHolidays: v })}
        />
        <ToggleRow
          label="المناسبات الدينية"
          description="عرض الأعياد الدينية (تقديرية حسب رؤية الهلال)"
          checked={s.showReligious}
          onChange={(v) => set({ showReligious: v })}
        />
        <ToggleRow
          label="الملاحظات"
          description="عرض النوتات داخل الأيام والنوت العام أسفل الشهر"
          checked={s.showNotes}
          onChange={(v) => set({ showNotes: v })}
        />
      </section>

      <Link href="/holidays" className="card mb-3 flex items-center gap-3 p-4 transition active:scale-[0.99]">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-subtle text-lg" aria-hidden>📅</span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold text-heading">إدارة العطل والمناسبات</span>
          <span className="mt-0.5 block text-xs text-muted">عدّل تواريخ العطل، احذفها، أو أضف مناسبات خاصة</span>
        </span>
        <span className="text-muted" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
        </span>
      </Link>

      <section className="card p-4">
        <div className="mb-1 font-bold text-danger">تصفير البيانات</div>
        <p className="mb-3 text-xs text-muted">
          حذف كل الإضافات والنوتات والإعدادات من هذا الجهاز. لا يمكن التراجع.
        </p>
        {!confirmReset ? (
          <button type="button" onClick={() => setConfirmReset(true)} className="btn btn-danger w-full">
            تصفير كل البيانات
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                update(() => defaultState());
                setConfirmReset(false);
              }}
              className="btn btn-danger flex-1"
            >
              تأكيد الحذف
            </button>
            <button type="button" onClick={() => setConfirmReset(false)} className="btn btn-ghost flex-1">
              إلغاء
            </button>
          </div>
        )}
      </section>

      <p className="mt-6 text-center text-xs text-muted">
        تقويمي — كل بياناتك محفوظة على جهازك فقط، بدون حساب أو خادم.
      </p>

      <BrandFooter />
    </div>
  );
}
