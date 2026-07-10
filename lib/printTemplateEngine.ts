import { buildMonthGrid, type DayCellModel } from './calendarEngine';
import { formatMonthTitle, monthKey } from './dateUtils';
import { hijriMonthLabel } from './hijriUtils';
import { holidayName } from './i18n';
import { effectiveHolidayMap } from './kuwaitHolidayService';
import type { AppState, DayItem, Holiday, Lang } from './types';

export interface PrintDayVM {
  day: number | null;
  iso: string | null;
  inMonth: boolean;
  isWeekend: boolean;
  holiday?: Holiday;
  holidayLabel?: string;     // اسم العطلة حسب اللغة (للعرض فقط)
  items: DayItem[];
  dayNote?: string;
}

export interface PrintMonthVM {
  year: number;
  month: number;
  title: string;
  hijriLabel: string;        // الشهر الهجري المقابل، مثل «محرّم – صفر ١٤٤٨»
  weekdayLabels: string[];
  cells: PrintDayVM[];       // 42
  generalNote?: string;
}

function buildDayVM(cell: DayCellModel, state: AppState, hmap: Map<string, Holiday>, lang: Lang): PrintDayVM {
  const { settings } = state;
  const holiday = cell.iso ? hmap.get(cell.iso) : undefined;
  // نفس منطق الشاشة: المناسبات الخاصة تظهر دائمًا؛ الدينية تتبع showReligious والرسمية showHolidays.
  const showHoliday =
    !!holiday &&
    (holiday.type === 'custom' ? true : holiday.isEstimated ? settings.showReligious : settings.showHolidays);
  const items = cell.iso ? state.items.filter((it) => it.date === cell.iso) : [];
  const dayNote = cell.iso && settings.showNotes ? state.dayNotes[cell.iso] : undefined;
  const shownHoliday = showHoliday ? holiday : undefined;
  return {
    day: cell.day,
    iso: cell.iso,
    inMonth: cell.inMonth,
    isWeekend: cell.isWeekend,
    holiday: shownHoliday,
    holidayLabel: shownHoliday ? holidayName(lang, shownHoliday) : undefined,
    items,
    dayNote: dayNote || undefined,
  };
}

export function buildPrintMonth(state: AppState, year: number, month: number, lang: Lang = 'ar'): PrintMonthVM {
  const grid = buildMonthGrid({
    year,
    month,
    weekStart: state.settings.weekStart,
    weekendDows: state.settings.weekendDows,
    todayISO: '',
    lang,
  });
  const hmap = effectiveHolidayMap(year, state);
  const cells = grid.cells.map((c) => buildDayVM(c, state, hmap, lang));
  const gn = state.settings.showNotes ? state.generalNotes[monthKey(year, month)] : undefined;
  return {
    year,
    month,
    title: formatMonthTitle(year, month, lang),
    hijriLabel: hijriMonthLabel(year, month, lang),
    weekdayLabels: grid.weekdayLabelsShort,
    cells,
    generalNote: gn || undefined,
  };
}

export function buildPrintYear(state: AppState, year: number, lang: Lang = 'ar'): PrintMonthVM[] {
  const out: PrintMonthVM[] = [];
  for (let m = 1; m <= 12; m++) out.push(buildPrintMonth(state, year, m, lang));
  return out;
}
