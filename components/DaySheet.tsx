'use client';

import { useMemo, useState } from 'react';
import { CATEGORIES, CATEGORY_ORDER, COLOR_SWATCHES, AR_MONTHS, AR_WEEKDAYS, HOLIDAY_TYPE_TINT } from '@/lib/constants';
import { dayOfWeek, parseYMD } from '@/lib/dateUtils';
import { getEffectiveHolidayForDate } from '@/lib/kuwaitHolidayService';
import { uid } from '@/lib/storage';
import { isTrack180Workday, TRACK180_LEAVE_ORDER, TRACK180_LEAVE_TYPES } from '@/lib/track180';
import type { Category, DayItem, Track180LeaveType } from '@/lib/types';
import { useApp } from './AppStateProvider';
import { BottomSheet } from './BottomSheet';
import { EstimatedBadge } from './EstimatedBadge';

function fullDate(iso: string): string {
  const { y, m, d } = parseYMD(iso);
  return `${AR_WEEKDAYS[dayOfWeek(y, m, d)]}، ${d} ${AR_MONTHS[m - 1]} ${y}`;
}

export function DaySheet({
  iso,
  onClose,
  onOpenRange,
}: {
  iso: string;
  onClose: () => void;
  onOpenRange?: (iso: string) => void;
}) {
  const { state, update } = useApp();

  const holiday = useMemo(() => getEffectiveHolidayForDate(iso, state), [iso, state]);
  const dayItems = useMemo(() => state.items.filter((i) => i.date === iso), [state.items, iso]);
  const note = state.dayNotes[iso] ?? '';

  // «تتبع ١٨٠ يوم»: حالة اليوم + هل هو يوم عمل يدخل في الحسبة (مصدر واحد: lib/track180)
  const dayStatus = state.track180Days[iso];
  const isWorkday = useMemo(() => isTrack180Workday(iso, state), [iso, state]);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('event');
  const [color, setColor] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  function resetForm() {
    setTitle('');
    setCategory('event');
    setColor(null);
    setEditingId(null);
  }

  function setNote(text: string) {
    update((s) => {
      const next = { ...s.dayNotes };
      if (text.trim() === '') delete next[iso];
      else next[iso] = text;
      return { ...s, dayNotes: next };
    });
  }

  function setDayStatus(type: Track180LeaveType | null) {
    update((s) => {
      const next = { ...s.track180Days };
      if (type === null) delete next[iso];
      else next[iso] = type;
      return { ...s, track180Days: next };
    });
  }

  function submitItem() {
    const t = title.trim();
    if (!t) return;
    if (editingId) {
      update((s) => ({
        ...s,
        items: s.items.map((i) =>
          i.id === editingId ? { ...i, title: t, category, color: color ?? undefined } : i,
        ),
      }));
    } else {
      const item: DayItem = {
        id: uid(),
        date: iso,
        title: t,
        category,
        color: color ?? undefined,
        createdAt: Date.now(),
      };
      update((s) => ({ ...s, items: [...s.items, item] }));
    }
    resetForm();
  }

  function editItem(it: DayItem) {
    setEditingId(it.id);
    setTitle(it.title);
    setCategory(it.category);
    setColor(it.color ?? null);
  }

  function deleteItem(id: string) {
    update((s) => ({ ...s, items: s.items.filter((i) => i.id !== id) }));
    if (editingId === id) resetForm();
  }

  return (
    <BottomSheet open onClose={onClose} title={fullDate(iso)} subtitle="أضف مناسباتك ونوتة اليوم">
      {holiday && (
        <div className={`mb-4 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${HOLIDAY_TYPE_TINT[holiday.type]}`}>
          <span aria-hidden>📅</span>
          <span>{holiday.nameAr}</span>
          {holiday.isEstimated && <EstimatedBadge className="ms-auto" />}
        </div>
      )}

      {/* نوت اليوم */}
      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-bold text-heading">نوتة داخل اليوم</label>
        <textarea
          className="field min-h-[72px] resize-y"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="تظهر داخل خانة اليوم وتُطبع معه…"
        />
      </div>

      {/* حالة الدوام — تتبع ١٨٠ يوم */}
      {state.settings.track180 && (
        <div className="mb-5">
          <div className="mb-1.5 flex items-center gap-2 text-sm font-bold text-heading">
            <span aria-hidden>🎯</span>
            حالة الدوام
            <span className="text-xs font-semibold text-muted">تتبع ١٨٠ يوم</span>
          </div>
          {isWorkday ? (
            <>
              <div role="group" aria-label="حالة الدوام" className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setDayStatus(null)}
                  aria-pressed={dayStatus === undefined}
                  className={`chip ${dayStatus === undefined ? 'border-navy bg-navy text-white' : 'text-ink'}`}
                >
                  <span aria-hidden>💼</span>
                  دوام
                </button>
                {TRACK180_LEAVE_ORDER.map((t) => {
                  const active = dayStatus === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setDayStatus(active ? null : t)}
                      aria-pressed={active}
                      className={`chip ${active ? 'border-navy bg-navy text-white' : 'text-ink'}`}
                    >
                      <span aria-hidden>{TRACK180_LEAVE_TYPES[t].emoji}</span>
                      {TRACK180_LEAVE_TYPES[t].label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-1.5 text-[11px] text-muted">
                اليوم بلا حالة يُحسب دوامًا تلقائيًا — حدّد نوع الإجازة فقط عند الغياب.
              </p>
              {onOpenRange && (
                <button
                  type="button"
                  onClick={() => onOpenRange(iso)}
                  className="btn btn-ghost mt-2 w-full text-sm"
                >
                  <span aria-hidden>＋</span> تسجيل إجازة لعدة أيام من هذا اليوم
                </button>
              )}
            </>
          ) : (
            <>
              <p className="text-xs text-muted">يوم راحة أو عطلة رسمية — لا يدخل في حسبة الدوام.</p>
              {dayStatus !== undefined && (
                <button type="button" onClick={() => setDayStatus(null)} className="btn btn-ghost mt-2 w-full text-sm">
                  إزالة الحالة المسجّلة سابقًا ({TRACK180_LEAVE_TYPES[dayStatus]?.label ?? 'إجازة'})
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* الإضافات الحالية */}
      {dayItems.length > 0 && (
        <div className="mb-5">
          <div className="mb-2 text-sm font-bold text-heading">إضافات هذا اليوم</div>
          <ul className="flex flex-col gap-2">
            {dayItems.map((it) => (
              <li key={it.id} className="flex items-center gap-2 rounded-xl border border-line bg-canvas px-3 py-2">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ background: it.color || CATEGORIES[it.category].color }}
                />
                <span className="shrink-0" aria-hidden>
                  {CATEGORIES[it.category].emoji}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{it.title}</span>
                <button
                  type="button"
                  onClick={() => editItem(it)}
                  className="rounded-lg bg-subtle px-2 py-1 text-xs font-bold text-heading"
                >
                  تعديل
                </button>
                <button
                  type="button"
                  onClick={() => deleteItem(it.id)}
                  className="rounded-lg bg-danger-soft px-2 py-1 text-xs font-bold text-danger"
                >
                  حذف
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* نموذج الإضافة/التعديل */}
      <div className="rounded-xl2 border border-line bg-canvas p-3">
        <div className="mb-2 text-sm font-bold text-heading">{editingId ? 'تعديل الإضافة' : 'إضافة جديدة'}</div>

        <input
          className="field mb-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="العنوان (مثال: اجتماع، عيد ميلاد أحمد…)"
          onKeyDown={(e) => {
            if (e.key === 'Enter') submitItem();
          }}
        />

        <div className="mb-3">
          <div className="mb-1.5 text-xs font-semibold text-muted">التصنيف</div>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_ORDER.map((c) => {
              const active = category === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`chip ${active ? 'border-navy bg-navy text-white' : 'text-ink'}`}
                >
                  <span aria-hidden>{CATEGORIES[c].emoji}</span>
                  {CATEGORIES[c].label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-4">
          <div className="mb-1.5 text-xs font-semibold text-muted">لون (اختياري)</div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setColor(null)}
              className={`flex h-8 items-center rounded-full border px-3 text-xs font-semibold ${
                color === null ? 'border-heading bg-subtle text-heading' : 'border-line text-muted'
              }`}
            >
              حسب التصنيف
            </button>
            {COLOR_SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`لون ${c}`}
                onClick={() => setColor(c)}
                className={`h-8 w-8 rounded-full border-2 transition ${
                  color === c ? 'border-heading ring-2 ring-heading/40' : 'border-surface'
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button type="button" onClick={submitItem} disabled={!title.trim()} className="btn btn-primary flex-1">
            {editingId ? 'حفظ التعديل' : 'إضافة'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="btn btn-ghost">
              إلغاء
            </button>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}
