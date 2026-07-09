'use client';

import Link from 'next/link';
import { buildMonthGrid } from '@/lib/calendarEngine';
import { AR_MONTHS } from '@/lib/constants';
import type { Holiday, Settings } from '@/lib/types';

function tint(h: Holiday | undefined, isWeekend: boolean, settings: Settings): string {
  if (h) {
    const visible = h.type === 'custom' || (h.isEstimated ? settings.showReligious : settings.showHolidays);
    if (visible) {
      if (h.type === 'national') return 'bg-national-soft text-national';
      if (h.type === 'government') return 'bg-gold text-navy';
      if (h.type === 'custom') return 'bg-navy text-white';
      return 'bg-religious-soft text-religious';
    }
  }
  if (isWeekend) return 'bg-weekend text-muted';
  return 'text-ink';
}

export function MiniMonth({
  year,
  month,
  settings,
  todayISO,
  dayNotes,
  itemDates,
  holidays,
}: {
  year: number;
  month: number;
  settings: Settings;
  todayISO: string;
  dayNotes: Record<string, string>;
  itemDates: Set<string>;
  holidays: Map<string, Holiday>;
}) {
  const grid = buildMonthGrid({
    year,
    month,
    weekStart: settings.weekStart,
    weekendDows: settings.weekendDows,
    todayISO,
  });
  const weekendCols = grid.weekdayLabelsShort.map((_, i) =>
    settings.weekendDows.includes((settings.weekStart + i) % 7),
  );

  return (
    <Link
      href={{ pathname: '/', query: { y: year, m: month } }}
      className="card block p-2 transition active:scale-[0.98]"
    >
      <div className="mb-1 text-center text-sm font-extrabold text-heading">{AR_MONTHS[month - 1]}</div>
      <div className="grid grid-cols-7 gap-px">
        {grid.weekdayLetters.map((letter, i) => (
          <div key={i} className={`text-center text-[8px] font-bold ${weekendCols[i] ? 'text-national' : 'text-muted'}`}>
            {letter}
          </div>
        ))}
        {grid.cells.map((cell, i) => {
          if (!cell.inMonth || !cell.iso) return <div key={`p${i}`} />;
          const h = holidays.get(cell.iso);
          const hasNote = settings.showNotes && (!!dayNotes[cell.iso] || itemDates.has(cell.iso));
          return (
            <div
              key={cell.iso}
              className={`relative flex aspect-square items-center justify-center rounded text-[9px] font-semibold ${tint(
                h,
                cell.isWeekend,
                settings,
              )} ${cell.isToday ? 'ring-1 ring-gold' : ''}`}
            >
              <span className="num">{cell.day}</span>
              {hasNote && <span className="absolute bottom-0 h-0.5 w-0.5 rounded-full bg-gold" />}
            </div>
          );
        })}
      </div>
    </Link>
  );
}
