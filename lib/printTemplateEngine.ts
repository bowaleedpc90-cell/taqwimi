import { buildMonthGrid, type DayCellModel } from './calendarEngine';
import { formatMonthTitle, monthKey } from './dateUtils';
import { effectiveHolidayMap } from './kuwaitHolidayService';
import type { AppState, DayItem, Holiday } from './types';

export interface PrintDayVM {
  day: number | null;
  iso: string | null;
  inMonth: boolean;
  isWeekend: boolean;
  holiday?: Holiday;
  items: DayItem[];
  dayNote?: string;
}

export interface PrintMonthVM {
  year: number;
  month: number;
  title: string;
  weekdayLabels: string[];
  cells: PrintDayVM[];       // 42
  generalNote?: string;
}

function buildDayVM(cell: DayCellModel, state: AppState, hmap: Map<string, Holiday>): PrintDayVM {
  const { settings } = state;
  const holiday = cell.iso ? hmap.get(cell.iso) : undefined;
  // نفس منطق الشاشة: المناسبات الخاصة تظهر دائمًا؛ الدينية تتبع showReligious والرسمية showHolidays.
  const showHoliday =
    !!holiday &&
    (holiday.type === 'custom' ? true : holiday.isEstimated ? settings.showReligious : settings.showHolidays);
  const items = cell.iso ? state.items.filter((it) => it.date === cell.iso) : [];
  const dayNote = cell.iso && settings.showNotes ? state.dayNotes[cell.iso] : undefined;
  return {
    day: cell.day,
    iso: cell.iso,
    inMonth: cell.inMonth,
    isWeekend: cell.isWeekend,
    holiday: showHoliday ? holiday : undefined,
    items,
    dayNote: dayNote || undefined,
  };
}

export function buildPrintMonth(state: AppState, year: number, month: number): PrintMonthVM {
  const grid = buildMonthGrid({
    year,
    month,
    weekStart: state.settings.weekStart,
    weekendDows: state.settings.weekendDows,
    todayISO: '',
  });
  const hmap = effectiveHolidayMap(year, state);
  const cells = grid.cells.map((c) => buildDayVM(c, state, hmap));
  const gn = state.settings.showNotes ? state.generalNotes[monthKey(year, month)] : undefined;
  return {
    year,
    month,
    title: formatMonthTitle(year, month),
    weekdayLabels: grid.weekdayLabelsShort,
    cells,
    generalNote: gn || undefined,
  };
}

export function buildPrintYear(state: AppState, year: number): PrintMonthVM[] {
  const out: PrintMonthVM[] = [];
  for (let m = 1; m <= 12; m++) out.push(buildPrintMonth(state, year, m));
  return out;
}
