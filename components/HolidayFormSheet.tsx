'use client';

import { useState } from 'react';
import { HOLIDAY_TYPE_LABEL } from '@/lib/constants';
import type { HolidayType } from '@/lib/types';
import { BottomSheet } from './BottomSheet';

const TYPE_ORDER: HolidayType[] = ['national', 'government', 'religious', 'custom'];

export interface HolidayFormValue {
  nameAr: string;
  gregorianDate: string; // "YYYY-MM-DD"
  type: HolidayType;
}

export function HolidayFormSheet({
  open,
  onClose,
  title,
  initial,
  estimatedHint = false,
  yearLock,
  onSave,
  onDelete,
  deleteLabel = 'حذف',
  onRestore,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  initial: HolidayFormValue;
  estimatedHint?: boolean;
  yearLock?: number; // إن حُدّد، يُقيَّد التاريخ ضمن هذه السنة (للعطل الرسمية المرتبطة بسنتها)
  onSave: (value: HolidayFormValue) => void;
  onDelete?: () => void;
  deleteLabel?: string;
  onRestore?: () => void;
}) {
  const [nameAr, setNameAr] = useState(initial.nameAr);
  const [gregorianDate, setDate] = useState(initial.gregorianDate);
  const [type, setType] = useState<HolidayType>(initial.type);

  const inYear = yearLock === undefined || gregorianDate.startsWith(`${yearLock}-`);
  const valid = nameAr.trim() !== '' && /^\d{4}-\d{2}-\d{2}$/.test(gregorianDate) && inYear;

  function save() {
    if (!valid) return;
    onSave({ nameAr: nameAr.trim(), gregorianDate, type });
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={title} subtitle="الاسم والتاريخ والنوع">
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-bold text-navy">الاسم</label>
        <input
          className="field"
          value={nameAr}
          onChange={(e) => setNameAr(e.target.value)}
          placeholder="مثال: عيد الأضحى، إجازة خاصة…"
          autoFocus
        />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-bold text-navy">التاريخ (ميلادي)</label>
        <input
          type="date"
          className="field"
          value={gregorianDate}
          min={yearLock !== undefined ? `${yearLock}-01-01` : undefined}
          max={yearLock !== undefined ? `${yearLock}-12-31` : undefined}
          onChange={(e) => setDate(e.target.value)}
        />
        {yearLock !== undefined && !inYear && gregorianDate !== '' && (
          <p className="mt-1.5 text-xs font-semibold text-red-600">
            تاريخ العطلة الرسمية لازم يكون ضمن سنة {yearLock}. لمناسبة في سنة أخرى استخدم «إضافة».
          </p>
        )}
      </div>

      <div className="mb-4">
        <div className="mb-1.5 text-sm font-bold text-navy">النوع</div>
        <div className="flex flex-wrap gap-2">
          {TYPE_ORDER.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`chip ${type === t ? 'border-navy bg-navy text-white' : 'text-ink'}`}
            >
              {HOLIDAY_TYPE_LABEL[t]}
            </button>
          ))}
        </div>
      </div>

      {estimatedHint && (
        <p className="mb-4 rounded-xl bg-religious-soft px-3 py-2 text-xs leading-relaxed text-religious">
          هذه المناسبة تقديرية (تعتمد على رؤية الهلال). عند تأكّدها رسميًا احفظها هنا لتثبيتها وإزالة شارة «تقديري».
        </p>
      )}

      <div className="flex flex-col gap-2">
        <button type="button" onClick={save} disabled={!valid} className="btn btn-primary w-full">
          حفظ
        </button>
        {onRestore && (
          <button type="button" onClick={onRestore} className="btn btn-ghost w-full">
            استعادة الأصل
          </button>
        )}
        {onDelete && (
          <button type="button" onClick={onDelete} className="btn btn-danger w-full">
            {deleteLabel}
          </button>
        )}
      </div>
    </BottomSheet>
  );
}
