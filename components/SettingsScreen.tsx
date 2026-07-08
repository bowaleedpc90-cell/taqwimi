'use client';

import { useState } from 'react';
import { defaultState } from '@/lib/storage';
import { useApp } from './AppStateProvider';
import { ToggleRow } from './ToggleRow';
import { BrandFooter } from './BrandFooter';

const WEEK_START_OPTIONS = [
  { value: 6, label: 'السبت' },
  { value: 0, label: 'الأحد' },
  { value: 1, label: 'الاثنين' },
];

export function SettingsScreen() {
  const { state, hydrated, update } = useApp();
  const [confirmReset, setConfirmReset] = useState(false);

  if (!hydrated) {
    return <div className="h-[50dvh] animate-pulse rounded-xl2 bg-navy-50/60" />;
  }

  const s = state.settings;
  const set = (patch: Partial<typeof s>) => update((st) => ({ ...st, settings: { ...st.settings, ...patch } }));

  return (
    <div>
      <h1 className="mb-4 flex items-center gap-2 text-xl font-extrabold text-navy">
        <span aria-hidden>⚙️</span> الإعدادات
      </h1>

      <section className="card mb-3 p-4">
        <div className="mb-2 font-bold text-navy">بداية الأسبوع</div>
        <div className="inline-flex w-full rounded-full bg-canvas p-1 text-sm font-bold">
          {WEEK_START_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set({ weekStart: opt.value })}
              className={`flex-1 rounded-full px-3 py-2 transition ${
                s.weekStart === opt.value ? 'bg-navy text-white shadow-sm' : 'text-muted'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">نهاية الأسبوع (الجمعة والسبت) مميّزة تلقائيًا في الرزنامة.</p>
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

      <section className="card p-4">
        <div className="mb-1 font-bold text-red-600">تصفير البيانات</div>
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
