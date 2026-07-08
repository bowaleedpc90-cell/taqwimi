import { CATEGORIES, HOLIDAY_TYPE_BG, HOLIDAY_TYPE_TEXT } from '@/lib/constants';
import type { HolidayType } from '@/lib/types';
import type { PrintDayVM, PrintMonthVM } from '@/lib/printTemplateEngine';
import { EstimatedBadge } from './EstimatedBadge';
import { MonthWatermark } from './MonthWatermark';

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';

// ألوان الطباعة مشتقّة من نفس مصدر الشاشة (تعالج M1/M2). الخلايا العادية شبه شفافة
// لتظهر خلفية الشهر بنعومة مع بقاء الأرقام والعطل واضحة.
function cellBg(vm: PrintDayVM): string {
  if (!vm.inMonth) return 'bg-canvas/30';
  if (vm.holiday) return HOLIDAY_TYPE_BG[vm.holiday.type];
  if (vm.isWeekend) return 'bg-weekend/70';
  return 'bg-white/60';
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const LEGEND: { type: HolidayType; label: string }[] = [
  { type: 'national', label: 'وطنية' },
  { type: 'government', label: 'رسمية' },
  { type: 'religious', label: 'دينية' },
  { type: 'custom', label: 'خاصة' },
];

export function PrintMonth({ vm, showWatermark = true }: { vm: PrintMonthVM; showWatermark?: boolean }) {
  const weeks = chunk(vm.cells, 7);
  return (
    <section className="print-page relative mb-6 flex min-h-[540px] flex-col overflow-hidden rounded-xl border border-line bg-white p-4 shadow-card print:mb-0 print:min-h-0 print:rounded-none print:border-0 print:shadow-none">
      {showWatermark && <MonthWatermark month={vm.month} eager />}

      <div className="relative z-10 flex h-full flex-col">
        {/* الترويسة */}
        <header className="mb-3 flex items-end justify-between border-b-2 border-navy pb-2">
          <div>
            <h2 className="text-2xl font-extrabold leading-none text-navy">{vm.title}</h2>
            <div className="mt-1 text-sm font-semibold text-religious">{vm.hijriLabel} هـ</div>
          </div>
          <div className="flex items-center gap-1.5 text-base font-extrabold text-gold">
            <span aria-hidden>🗓️</span> تقويمي
          </div>
        </header>

        {/* رأس أيام الأسبوع */}
        <div className="grid grid-cols-7 gap-px">
          {vm.weekdayLabels.map((l, i) => (
            <div key={i} className="rounded-t bg-navy py-1 text-center text-[12px] font-bold text-white">
              {l}
            </div>
          ))}
        </div>

        {/* الشبكة — تملأ ارتفاع الصفحة */}
        <div className="flex min-h-0 flex-1 flex-col gap-px">
          {weeks.map((week, wi) => (
            <div key={wi} className="cal-row grid min-h-0 flex-1 grid-cols-7 gap-px overflow-hidden">
              {week.map((cell, ci) => (
                <div
                  key={cell.iso ?? `p-${wi}-${ci}`}
                  className={`print-day flex flex-col border border-line/70 p-1 ${cellBg(cell)}`}
                >
                  {cell.inMonth && (
                    <>
                      <div className="flex items-start justify-between">
                        <span className="num text-[15px] font-bold text-ink">{cell.day}</span>
                        {cell.holiday?.isEstimated && <EstimatedBadge />}
                      </div>
                      {cell.holiday && (
                        <div className={`holiday-name mt-0.5 text-[10px] font-bold leading-tight ${HOLIDAY_TYPE_TEXT[cell.holiday.type]}`}>
                          {cell.holiday.nameAr}
                        </div>
                      )}
                      {cell.items.map((it) => (
                        <div key={it.id} className="mt-0.5 flex items-center gap-1 text-[9px] font-semibold leading-tight text-ink">
                          <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: it.color || CATEGORIES[it.category].color }} />
                          <span className="truncate">{it.title}</span>
                        </div>
                      ))}
                      {cell.dayNote && (
                        <div className="day-note mt-auto pt-0.5 text-[9px] leading-tight text-muted">📝 {cell.dayNote}</div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* ملاحظات الشهر */}
        {vm.generalNote && (
          <div className="general-note mt-2 rounded-lg border border-line bg-canvas/70 p-2 text-[11px] leading-relaxed text-ink">
            <span className="font-bold text-navy">ملاحظات: </span>
            {vm.generalNote}
          </div>
        )}

        {/* التذييل: مفتاح الألوان + الهوية */}
        <footer className="mt-2.5 flex items-center justify-between gap-3 border-t border-line pt-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {LEGEND.map((it) => (
              <span key={it.type} className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted">
                <span className={`inline-block h-2.5 w-2.5 rounded-sm ${HOLIDAY_TYPE_BG[it.type]} border border-line`} />
                {it.label}
              </span>
            ))}
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted">
              <span className="inline-block h-2.5 w-2.5 rounded-sm border border-line bg-weekend" />
              نهاية الأسبوع
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <img src={`${base}/xstar-logo.svg`} alt="X Star Software" width={22} height={22} className="rounded" />
            <span className="flex flex-col leading-tight">
              <span className="text-[10px] font-extrabold text-navy">X Star Software</span>
              <span className="text-[9px] font-semibold text-[#2176FF]">xstarkw.com</span>
            </span>
          </div>
        </footer>
      </div>
    </section>
  );
}
