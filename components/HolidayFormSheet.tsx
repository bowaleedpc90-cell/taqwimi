'use client';

import { useState } from 'react';
import type { HolidayType } from '@/lib/types';
import { useLang } from './LanguageProvider';
import { holidayTypeLabel } from '@/lib/i18n';
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
  deleteLabel,
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
  const { lang, t } = useLang();
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
    <BottomSheet open={open} onClose={onClose} title={title} subtitle={t('الاسم والتاريخ والنوع')}>
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-bold text-heading">{t('الاسم')}</label>
        <input
          className="field"
          value={nameAr}
          onChange={(e) => setNameAr(e.target.value)}
          placeholder={t('مثال: عيد الأضحى، إجازة خاصة…')}
          autoFocus
        />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-bold text-heading">{t('التاريخ (ميلادي)')}</label>
        <input
          type="date"
          className="field"
          value={gregorianDate}
          min={yearLock !== undefined ? `${yearLock}-01-01` : undefined}
          max={yearLock !== undefined ? `${yearLock}-12-31` : undefined}
          onChange={(e) => setDate(e.target.value)}
        />
        {yearLock !== undefined && !inYear && gregorianDate !== '' && (
          <p className="mt-1.5 text-xs font-semibold text-danger">
            {t('تاريخ العطلة الرسمية لازم يكون ضمن سنة {n}. لمناسبة في سنة أخرى استخدم «إضافة».', { n: yearLock })}
          </p>
        )}
      </div>

      <div className="mb-4">
        <div className="mb-1.5 text-sm font-bold text-heading">{t('النوع')}</div>
        <div className="flex flex-wrap gap-2">
          {TYPE_ORDER.map((ht) => (
            <button
              key={ht}
              type="button"
              onClick={() => setType(ht)}
              className={`chip ${type === ht ? 'border-navy bg-navy text-white' : 'text-ink'}`}
            >
              {holidayTypeLabel(lang, ht)}
            </button>
          ))}
        </div>
      </div>

      {estimatedHint && (
        <p className="mb-4 rounded-xl bg-religious-soft px-3 py-2 text-xs leading-relaxed text-religious">
          {t('هذه المناسبة تقديرية (تعتمد على رؤية الهلال). عند تأكّدها رسميًا احفظها هنا لتثبيتها وإزالة شارة «تقديري».')}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <button type="button" onClick={save} disabled={!valid} className="btn btn-primary w-full">
          {t('حفظ')}
        </button>
        {onRestore && (
          <button type="button" onClick={onRestore} className="btn btn-ghost w-full">
            {t('استعادة الأصل')}
          </button>
        )}
        {onDelete && (
          <button type="button" onClick={onDelete} className="btn btn-danger w-full">
            {deleteLabel ?? t('حذف')}
          </button>
        )}
      </div>
    </BottomSheet>
  );
}
