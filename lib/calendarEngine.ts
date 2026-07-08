import { AR_WEEKDAYS, AR_WEEKDAYS_SHORT } from './constants';
import { dayOfWeek, daysInMonth, ymd } from './dateUtils';

export interface DayCellModel {
  iso: string | null;   // null لخانات الحشو
  day: number | null;
  dow: number;          // 0..6
  inMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

export interface MonthGrid {
  year: number;
  month: number;             // 1-12
  weekStart: number;         // 0..6
  weekdayLabels: string[];   // 7، الفهرس 0 = weekStart
  weekdayLabelsShort: string[];
  cells: DayCellModel[];     // دائمًا 42 (6×7)
  weeks: DayCellModel[][];   // 6 صفوف × 7
}

export const isWeekendDow = (dow: number, weekendDows: number[] = [5, 6]): boolean =>
  weekendDows.includes(dow);

/** أسماء الأيام مُدوَّرة لتبدأ من weekStart. */
export function getWeekdayLabels(weekStart: number, short = false): string[] {
  const src = short ? AR_WEEKDAYS_SHORT : AR_WEEKDAYS;
  const out: string[] = [];
  for (let i = 0; i < 7; i++) out.push(src[(weekStart + i) % 7]);
  return out;
}

export interface BuildMonthGridOpts {
  year: number;
  month: number;          // 1-12
  weekStart?: number;     // الافتراضي 0 (الأحد)
  weekendDows?: number[]; // الافتراضي [5,6]
  todayISO?: string;      // من todayInKuwait()؛ '' يُعطّل تمييز اليوم
}

/**
 * يبني شبكة ثابتة 6×7. البيانات بترتيب منطقي (الفهرس 0 = weekStart) — لا نعكسها
 * يدويًا؛ CSS dir="rtl" هو الذي يضع أول عمود على اليمين. رأس الأيام يستخدم نفس الترتيب.
 */
export function buildMonthGrid(opts: BuildMonthGridOpts): MonthGrid {
  const { year, month } = opts;
  const weekStart = opts.weekStart ?? 0;
  const weekendDows = opts.weekendDows ?? [5, 6];
  const todayISO = opts.todayISO ?? '';

  const firstDow = dayOfWeek(year, month, 1);
  const lead = (((firstDow - weekStart) % 7) + 7) % 7; // خانات حشو قبل اليوم الأول
  const dim = daysInMonth(year, month);

  const cells: DayCellModel[] = [];
  for (let i = 0; i < 42; i++) {
    const col = i % 7;
    const dow = (weekStart + col) % 7;
    const dayNum = i - lead + 1;
    const inMonth = dayNum >= 1 && dayNum <= dim;
    const iso = inMonth ? ymd(year, month, dayNum) : null;
    cells.push({
      iso,
      day: inMonth ? dayNum : null,
      dow,
      inMonth,
      isToday: inMonth && todayISO !== '' && iso === todayISO,
      isWeekend: isWeekendDow(dow, weekendDows),
    });
  }

  const weeks: DayCellModel[][] = [];
  for (let r = 0; r < 6; r++) weeks.push(cells.slice(r * 7, r * 7 + 7));

  return {
    year,
    month,
    weekStart,
    weekdayLabels: getWeekdayLabels(weekStart, false),
    weekdayLabelsShort: getWeekdayLabels(weekStart, true),
    cells,
    weeks,
  };
}
