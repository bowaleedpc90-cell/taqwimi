'use client';

import { getBuiltInHolidaysForYear } from '@/lib/kuwaitHolidayService';
import {
  addCustomHoliday,
  deleteBuiltInHoliday,
  deleteCustomHoliday,
  restoreHoliday,
  setHolidayOverride,
  updateCustomHoliday,
} from '@/lib/holidayActions';
import type { AppState } from '@/lib/types';
import { useApp } from './AppStateProvider';
import { HolidayFormSheet, type HolidayFormValue } from './HolidayFormSheet';

export type HolidayEditing =
  | { mode: 'add'; date: string }
  | { mode: 'builtin'; slug: string; value: HolidayFormValue; wasEstimated: boolean; edited: boolean }
  | { mode: 'custom'; id: string; value: HolidayFormValue }
  | null;

/** يبني واصف تعديل لعطلة رسمية مضمّنة من الحالة الحالية (يُطبّق التعديلات السابقة إن وُجدت). */
export function builtinEditingFor(year: number, slug: string, state: AppState): HolidayEditing {
  const base = getBuiltInHolidaysForYear(year).find((h) => h.slug === slug);
  if (!base) return null;
  const ov = state.holidayOverrides?.[`${year}-${slug}`];
  return {
    mode: 'builtin',
    slug,
    value: {
      nameAr: ov?.nameAr ?? base.nameAr,
      gregorianDate: ov?.gregorianDate ?? base.gregorianDate,
      type: ov?.type ?? base.type,
    },
    wasEstimated: base.isEstimated,
    edited: !!ov && !!(ov.deleted || ov.gregorianDate || ov.nameAr || ov.type || ov.confirmed),
  };
}

/** يعرض نافذة التعديل المناسبة (إضافة/رسمية/مخصّصة) ويطبّق الحفظ عبر useApp. */
export function HolidayEditSheets({
  year,
  editing,
  onClose,
}: {
  year: number;
  editing: HolidayEditing;
  onClose: () => void;
}) {
  const { update } = useApp();
  if (!editing) return null;

  if (editing.mode === 'add') {
    return (
      <HolidayFormSheet
        key="add"
        open
        onClose={onClose}
        title="إضافة عطلة / مناسبة"
        initial={{ nameAr: '', gregorianDate: editing.date, type: 'custom' }}
        onSave={(v) => {
          update((s) => addCustomHoliday(s, v));
          onClose();
        }}
      />
    );
  }

  if (editing.mode === 'builtin') {
    const { slug, value, wasEstimated, edited } = editing;
    return (
      <HolidayFormSheet
        key={`b-${slug}`}
        open
        onClose={onClose}
        title="تعديل عطلة رسمية"
        initial={value}
        estimatedHint={wasEstimated}
        yearLock={year}
        onSave={(v) => {
          update((s) =>
            setHolidayOverride(s, year, slug, {
              nameAr: v.nameAr,
              gregorianDate: v.gregorianDate,
              type: v.type,
              ...(wasEstimated ? { confirmed: true } : {}),
            }),
          );
          onClose();
        }}
        onDelete={() => {
          update((s) => deleteBuiltInHoliday(s, year, slug));
          onClose();
        }}
        deleteLabel="حذف العطلة"
        onRestore={
          edited
            ? () => {
                update((s) => restoreHoliday(s, year, slug));
                onClose();
              }
            : undefined
        }
      />
    );
  }

  const { id, value } = editing;
  return (
    <HolidayFormSheet
      key={`c-${id}`}
      open
      onClose={onClose}
      title="تعديل مناسبة"
      initial={value}
      onSave={(v) => {
        update((s) => updateCustomHoliday(s, id, v));
        onClose();
      }}
      onDelete={() => {
        update((s) => deleteCustomHoliday(s, id));
        onClose();
      }}
    />
  );
}
