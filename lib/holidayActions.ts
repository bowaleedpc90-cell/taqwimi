import type { AppState, Holiday, HolidayOverride, HolidayType } from './types';
import { overrideKey } from './kuwaitHolidayService';
import { uid } from './storage';

/** دمج تعديل على عطلة رسمية مضمّنة (بالـ slug) لسنة معيّنة. */
export function setHolidayOverride(
  state: AppState,
  year: number,
  slug: string,
  patch: HolidayOverride,
): AppState {
  const key = overrideKey(year, slug);
  const next = { ...state.holidayOverrides, [key]: { ...state.holidayOverrides[key], ...patch } };
  return { ...state, holidayOverrides: next };
}

/** حذف (إخفاء) عطلة رسمية مضمّنة. */
export function deleteBuiltInHoliday(state: AppState, year: number, slug: string): AppState {
  return setHolidayOverride(state, year, slug, { deleted: true });
}

/** إلغاء أي تعديل على عطلة رسمية واحدة (تعود لأصلها). */
export function restoreHoliday(state: AppState, year: number, slug: string): AppState {
  const key = overrideKey(year, slug);
  const next = { ...state.holidayOverrides };
  delete next[key];
  return { ...state, holidayOverrides: next };
}

/** تثبيت عطلة تقديرية كمؤكّدة (تُزال شارة «تقديري»). */
export function confirmHoliday(state: AppState, year: number, slug: string): AppState {
  return setHolidayOverride(state, year, slug, { confirmed: true });
}

/** استعادة كل العطل الرسمية الافتراضية لسنة معيّنة (يلغي كل التعديلات على المضمّنة لتلك السنة فقط، ولا يمسّ ما أضافه المستخدم). */
export function restoreYearDefaults(state: AppState, year: number): AppState {
  const prefix = `${year}-`;
  const next: Record<string, HolidayOverride> = {};
  for (const [k, v] of Object.entries(state.holidayOverrides)) {
    if (!k.startsWith(prefix)) next[k] = v;
  }
  return { ...state, holidayOverrides: next };
}

/** إضافة عطلة/مناسبة جديدة يضيفها المستخدم. */
export function addCustomHoliday(
  state: AppState,
  data: { nameAr: string; gregorianDate: string; type: HolidayType },
): AppState {
  const holiday: Holiday = {
    id: `custom-${uid()}`,
    slug: undefined,
    nameAr: data.nameAr.trim(),
    nameEn: data.nameAr.trim(),
    gregorianDate: data.gregorianDate,
    type: data.type,
    isConfirmed: true,
    isEstimated: false,
    isCustom: true,
  };
  return { ...state, customHolidays: [...state.customHolidays, holiday] };
}

/** تعديل عطلة أضافها المستخدم (بالـ id). */
export function updateCustomHoliday(
  state: AppState,
  id: string,
  patch: { nameAr?: string; gregorianDate?: string; type?: HolidayType },
): AppState {
  return {
    ...state,
    customHolidays: state.customHolidays.map((h) =>
      h.id === id
        ? {
            ...h,
            nameAr: patch.nameAr?.trim() ?? h.nameAr,
            nameEn: patch.nameAr?.trim() ?? h.nameEn,
            gregorianDate: patch.gregorianDate ?? h.gregorianDate,
            type: patch.type ?? h.type,
          }
        : h,
    ),
  };
}

/** حذف عطلة أضافها المستخدم. */
export function deleteCustomHoliday(state: AppState, id: string): AppState {
  return { ...state, customHolidays: state.customHolidays.filter((h) => h.id !== id) };
}
