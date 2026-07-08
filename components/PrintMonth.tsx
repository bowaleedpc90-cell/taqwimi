import { CATEGORIES } from '@/lib/constants';
import type { PrintDayVM, PrintMonthVM } from '@/lib/printTemplateEngine';
import { EstimatedBadge } from './EstimatedBadge';

function cellBg(vm: PrintDayVM): string {
  if (!vm.inMonth) return 'bg-canvas';
  if (vm.holiday?.type === 'national') return 'bg-national-soft';
  if (vm.holiday?.type === 'government') return 'bg-gold-soft';
  if (vm.holiday?.type === 'custom') return 'bg-navy-50';
  if (vm.holiday) return 'bg-religious-soft';
  if (vm.isWeekend) return 'bg-weekend';
  return 'bg-white';
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function PrintMonth({ vm }: { vm: PrintMonthVM }) {
  const weeks = chunk(vm.cells, 7);
  return (
    <section className="print-page mb-6 rounded-lg border border-line bg-white p-3 print:mb-0 print:rounded-none print:border-0">
      <header className="mb-2 flex items-baseline justify-between border-b-2 border-navy pb-2">
        <h2 className="text-xl font-extrabold text-navy">{vm.title}</h2>
        <span className="text-sm font-semibold text-gold">تقويمي</span>
      </header>

      <div className="grid grid-cols-7 gap-px">
        {vm.weekdayLabels.map((l, i) => (
          <div key={i} className="bg-navy py-1 text-center text-[11px] font-bold text-white">
            {l}
          </div>
        ))}
      </div>

      <div className="mt-px flex flex-col gap-px">
        {weeks.map((week, wi) => (
          <div key={wi} className="cal-row grid grid-cols-7 gap-px">
            {week.map((cell, ci) => (
              <div
                key={cell.iso ?? `p-${wi}-${ci}`}
                className={`print-day flex min-h-[74px] flex-col border border-line p-1 ${cellBg(cell)}`}
              >
                {cell.inMonth && (
                  <>
                    <div className="flex items-start justify-between">
                      <span className="num text-sm font-bold text-ink">{cell.day}</span>
                      {cell.holiday?.isEstimated && <EstimatedBadge />}
                    </div>
                    {cell.holiday && (
                      <div className="holiday-name text-[9px] font-bold leading-tight text-national">
                        {cell.holiday.nameAr}
                      </div>
                    )}
                    {cell.items.map((it) => (
                      <div key={it.id} className="mt-0.5 flex items-center gap-0.5 text-[8px] font-semibold leading-tight text-ink">
                        <span
                          className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: it.color || CATEGORIES[it.category].color }}
                        />
                        <span className="truncate">{it.title}</span>
                      </div>
                    ))}
                    {cell.dayNote && (
                      <div className="day-note mt-auto pt-0.5 text-[8px] leading-tight text-muted">
                        📝 {cell.dayNote}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {vm.generalNote && (
        <div className="general-note mt-2 rounded border border-line bg-canvas p-2 text-[11px] leading-relaxed text-ink">
          <span className="font-bold text-navy">ملاحظات: </span>
          {vm.generalNote}
        </div>
      )}
    </section>
  );
}
