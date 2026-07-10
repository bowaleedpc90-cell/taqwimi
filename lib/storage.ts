import { STORAGE_KEY } from './constants';
import type { AppState, Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  weekStart: 0,          // الأحد
  weekendDows: [5, 6],   // الجمعة + السبت
  showHolidays: true,
  showReligious: true,
  showNotes: true,
  track180: false,       // تتبع ١٨٠ يوم — مطفأ حتى يفعّله المستخدم
};

export function defaultState(): AppState {
  return {
    version: 2,
    settings: { ...DEFAULT_SETTINGS },
    items: [],
    dayNotes: {},
    generalNotes: {},
    customHolidays: [],
    holidayOverrides: {},
    track180Days: {},
  };
}

/** قراءة محميّة مع deep-merge فوق الافتراضي حتى لا ترجع مفاتيح جديدة undefined (تهاجر v1→v2). */
export function loadState(): AppState {
  if (typeof window === 'undefined') return defaultState();
  const d = defaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return d;
    const p = JSON.parse(raw) as Partial<AppState>;
    return {
      version: 2,
      settings: { ...d.settings, ...(p.settings || {}) },
      items: Array.isArray(p.items) ? p.items : [],
      dayNotes: p.dayNotes && typeof p.dayNotes === 'object' ? p.dayNotes : {},
      generalNotes: p.generalNotes && typeof p.generalNotes === 'object' ? p.generalNotes : {},
      customHolidays: Array.isArray(p.customHolidays) ? p.customHolidays : [],
      holidayOverrides:
        p.holidayOverrides && typeof p.holidayOverrides === 'object' ? p.holidayOverrides : {},
      track180Days: p.track180Days && typeof p.track180Days === 'object' ? p.track180Days : {},
    };
  } catch {
    return d;
  }
}

/** يرجع false عند فشل الكتابة (وضع iOS الخاص/امتلاء) بدل رمي استثناء. */
export function saveState(state: AppState): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
