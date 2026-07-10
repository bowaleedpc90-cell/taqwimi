'use client';

import { useId, useMemo, useState } from 'react';
import { compareISO } from '@/lib/dateUtils';
import {
  clearTrack180Range,
  setTrack180Range,
  track180WorkdaysInRange,
  TRACK180_LEAVE_ORDER,
  TRACK180_LEAVE_TYPES,
} from '@/lib/track180';
import type { Track180LeaveType } from '@/lib/types';
import { useApp } from './AppStateProvider';
import { BottomSheet } from './BottomSheet';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** تسجيل/مسح إجازة على فترة (عدة أيام) دفعة واحدة — تُطبَّق على أيام العمل فقط. */
export function Track180RangeSheet({ initialStart, onClose }: { initialStart: string; onClose: () => void }) {
  const { state, update } = useApp();
  const startId = useId();
  const endId = useId();
  const [type, setType] = useState<Track180LeaveType>('annual');
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialStart);

  const valid = DATE_RE.test(start) && DATE_RE.test(end);
  // نعكس الترتيب إن أدخل المستخدم النهاية قبل البداية
  const [s, e] = valid && compareISO(start, end) > 0 ? [end, start] : [start, end];

  const workdayCount = useMemo(
    () => (valid ? track180WorkdaysInRange(state, s, e).length : 0),
    [valid, state, s, e],
  );

  function save() {
    if (!valid || workdayCount === 0) return;
    update((st) => setTrack180Range(st, type, s, e));
    onClose();
  }

  function clearRange() {
    if (!valid) return;
    update((st) => clearTrack180Range(st, s, e));
    onClose();
  }

  return (
    <BottomSheet open onClose={onClose} title="تسجيل إجازة لعدة أيام" subtitle="اختر النوع وفترة الإجازة">
      <div className="mb-4">
        <div className="mb-1.5 text-sm font-bold text-heading">نوع الإجازة</div>
        <div role="group" aria-label="نوع الإجازة" className="flex flex-wrap gap-2">
          {TRACK180_LEAVE_ORDER.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              aria-pressed={type === t}
              className={`chip ${type === t ? 'border-navy bg-navy text-white' : 'text-ink'}`}
            >
              <span aria-hidden>{TRACK180_LEAVE_TYPES[t].emoji}</span>
              {TRACK180_LEAVE_TYPES[t].label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={startId} className="mb-1.5 block text-sm font-bold text-heading">
            من
          </label>
          <input
            id={startId}
            type="date"
            className="field"
            value={start}
            onChange={(ev) => setStart(ev.target.value)}
          />
        </div>
        <div>
          <label htmlFor={endId} className="mb-1.5 block text-sm font-bold text-heading">
            إلى
          </label>
          <input
            id={endId}
            type="date"
            className="field"
            value={end}
            min={DATE_RE.test(start) ? start : undefined}
            onChange={(ev) => setEnd(ev.target.value)}
          />
        </div>
      </div>

      <p className="mb-4 rounded-xl border border-line bg-canvas px-3 py-2 text-sm leading-relaxed text-muted">
        {!valid ? (
          'اختر تاريخ البداية والنهاية.'
        ) : workdayCount > 0 ? (
          <>
            سيتم تسجيل <span className="num font-bold text-heading">{workdayCount}</span> يوم عمل ضمن الفترة —
            تُستثنى نهاية الأسبوع والعطل الرسمية.
          </>
        ) : (
          'لا توجد أيام عمل ضمن الفترة المختارة (كلها راحة أو عطل).'
        )}
      </p>

      <div className="flex flex-col gap-2">
        <button type="button" onClick={save} disabled={!valid || workdayCount === 0} className="btn btn-primary w-full">
          حفظ الفترة
        </button>
        <button type="button" onClick={clearRange} disabled={!valid} className="btn btn-ghost w-full">
          مسح الحالات في الفترة
        </button>
      </div>
    </BottomSheet>
  );
}
