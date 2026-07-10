'use client';

import { CATEGORIES, HOLIDAY_TYPE_BG, HOLIDAY_TYPE_TEXT } from '@/lib/constants';
import type { DayCellModel } from '@/lib/calendarEngine';
import { TRACK180_LEAVE_TYPES } from '@/lib/track180';
import type { DayItem, Holiday, Track180LeaveType } from '@/lib/types';
import { useLongPress } from '@/hooks/useLongPress';
import { EstimatedBadge } from './EstimatedBadge';

export interface CellVM {
  cell: DayCellModel;
  holiday?: Holiday;
  items: DayItem[];
  hasNote: boolean;
  track180?: Track180LeaveType; // إجازة مسجّلة في «تتبع ١٨٠ يوم» (شاشة فقط — لا تُطبع)
}

function holidayTint(holiday?: Holiday, isWeekend?: boolean): string {
  if (holiday) return HOLIDAY_TYPE_BG[holiday.type];
  if (isWeekend) return 'bg-weekend';
  return 'bg-surface';
}

function holidayTextColor(holiday: Holiday): string {
  return HOLIDAY_TYPE_TEXT[holiday.type];
}

export function DayCell({
  vm,
  onSelect,
  onLongPress,
}: {
  vm: CellVM;
  onSelect: (iso: string) => void;
  onLongPress?: (iso: string) => void;
}) {
  const { cell, holiday, items, hasNote, track180 } = vm;
  const { longFired, handlers } = useLongPress(() => cell.iso && onLongPress?.(cell.iso));

  if (!cell.inMonth || !cell.iso) {
    return <div className="rounded-lg bg-transparent" aria-hidden />;
  }

  const iso = cell.iso;
  const dots = items.slice(0, 3);
  const extra = items.length - dots.length;

  return (
    <button
      type="button"
      {...handlers}
      onClick={() => {
        if (longFired.current) {
          longFired.current = false;
          return;
        }
        onSelect(iso);
      }}
      onContextMenu={(e) => e.preventDefault()}
      className={`print-day relative flex min-h-[64px] flex-col items-stretch rounded-lg border p-1 text-start transition active:scale-[0.97] ${holidayTint(
        holiday,
        cell.isWeekend,
      )} ${cell.isToday ? 'border-gold ring-2 ring-gold' : 'border-line'}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`num text-[15px] font-bold leading-none ${
            cell.isToday ? 'text-heading' : holiday?.type === 'national' ? 'text-national' : 'text-ink'
          }`}
        >
          {cell.day}
        </span>
        <span className="flex items-center gap-0.5">
          {track180 && (
            <span
              className="no-print h-2 w-2 rounded-full bg-danger"
              aria-label={`إجازة ${TRACK180_LEAVE_TYPES[track180]?.label ?? ''} — تتبع ١٨٠`}
            />
          )}
          {hasNote && <span className="h-2 w-2 rounded-full bg-gold" aria-label="نوت" />}
        </span>
      </div>

      {holiday && (
        <span
          className={`holiday-name mt-0.5 line-clamp-2 text-[10px] font-semibold leading-tight ${holidayTextColor(
            holiday,
          )}`}
        >
          {holiday.nameAr}
          {holiday.isEstimated && <EstimatedBadge className="ms-1 align-middle" />}
        </span>
      )}

      {dots.length > 0 && (
        <div className="mt-auto flex flex-wrap items-center gap-0.5 pt-0.5">
          {dots.map((it) => (
            <span
              key={it.id}
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: it.color || CATEGORIES[it.category].color }}
            />
          ))}
          {extra > 0 && <span className="num text-[9px] font-bold text-muted">+{extra}</span>}
        </div>
      )}
    </button>
  );
}
