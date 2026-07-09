'use client';

import { DayCell, type CellVM } from './DayCell';

export function CalendarGrid({
  weekdayLabels,
  cells,
  weekendCols,
  onSelectDay,
  onLongPressDay,
}: {
  weekdayLabels: string[];
  cells: CellVM[]; // 42
  weekendCols: boolean[]; // 7 — أي أعمدة نهاية أسبوع
  onSelectDay: (iso: string) => void;
  onLongPressDay: (iso: string) => void;
}) {
  return (
    <div className="card p-2">
      <div className="mb-1 grid grid-cols-7 gap-1">
        {weekdayLabels.map((label, i) => (
          <div
            key={i}
            className={`rounded-md py-1.5 text-center text-xs font-bold ${
              weekendCols[i] ? 'text-national' : 'text-muted'
            }`}
          >
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((vm, i) => (
          <DayCell key={vm.cell.iso ?? `pad-${i}`} vm={vm} onSelect={onSelectDay} onLongPress={onLongPressDay} />
        ))}
      </div>
    </div>
  );
}
