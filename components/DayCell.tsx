'use client';

import { CATEGORIES } from '@/lib/constants';
import type { DayCellModel } from '@/lib/calendarEngine';
import type { DayItem, Holiday } from '@/lib/types';
import { EstimatedBadge } from './EstimatedBadge';

export interface CellVM {
  cell: DayCellModel;
  holiday?: Holiday;
  items: DayItem[];
  hasNote: boolean;
}

function holidayTint(holiday?: Holiday, isWeekend?: boolean): string {
  if (holiday) {
    if (holiday.type === 'national') return 'bg-national-soft';
    if (holiday.type === 'government') return 'bg-gold-soft';
    if (holiday.type === 'custom') return 'bg-navy-50';
    return 'bg-religious-soft'; // religious
  }
  if (isWeekend) return 'bg-weekend';
  return 'bg-surface';
}

function holidayTextColor(holiday: Holiday): string {
  if (holiday.type === 'national') return 'text-national';
  if (holiday.type === 'government') return 'text-gold';
  if (holiday.type === 'custom') return 'text-navy';
  return 'text-religious';
}

export function DayCell({ vm, onSelect }: { vm: CellVM; onSelect: (iso: string) => void }) {
  const { cell, holiday, items, hasNote } = vm;

  if (!cell.inMonth || !cell.iso) {
    return <div className="rounded-lg bg-transparent" aria-hidden />;
  }

  const iso = cell.iso;
  const dots = items.slice(0, 3);
  const extra = items.length - dots.length;

  return (
    <button
      type="button"
      onClick={() => onSelect(iso)}
      className={`print-day relative flex min-h-[64px] flex-col items-stretch rounded-lg border p-1 text-start transition active:scale-[0.97] ${holidayTint(
        holiday,
        cell.isWeekend,
      )} ${cell.isToday ? 'border-gold ring-2 ring-gold' : 'border-line'}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`num text-[15px] font-bold leading-none ${
            cell.isToday ? 'text-navy' : holiday?.type === 'national' ? 'text-national' : 'text-ink'
          }`}
        >
          {cell.day}
        </span>
        {hasNote && <span className="h-2 w-2 rounded-full bg-gold" aria-label="نوت" />}
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
