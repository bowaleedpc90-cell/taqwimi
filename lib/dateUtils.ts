import { AR_MONTHS, EN_MONTHS, KUWAIT_TZ } from './constants';
import type { Lang } from './types';

// ملاحظة صارمة: لا نمرّر أبدًا نص "YYYY-MM-DD" إلى new Date() ولا نستخدم toISOString()
// للعرض. كل حساب لليوم من الأسبوع يتم بحساب صحيح صرف (Sakamoto) → لا انزياح بسبب
// المنطقة الزمنية. «اليوم» يُشتق من صيغة الكويت (en-CA + Asia/Kuwait) على العميل فقط.

/**
 * مدى السنوات المدعوم. الحدّ الأعلى يحمي محرّك العطل الهجري: سنة تتجاوز مدى
 * تواريخ ECMAScript (±275760) تُنتج Invalid Date فيرمي Intl.formatToParts
 * استثناء RangeError أثناء العرض. أي سنة من الرابط لازم تمرّ على isSupportedYear.
 */
export const MIN_YEAR = 1970;
export const MAX_YEAR = 2200;

/** سنة ضمن المدى المدعوم؟ يرفض NaN و Infinity والكسور صراحةً. */
export function isSupportedYear(y: number): boolean {
  return Number.isInteger(y) && y >= MIN_YEAR && y <= MAX_YEAR;
}

/** يحصر السنة داخل المدى المدعوم (لأزرار التنقّل التي تزيد/تنقص بلا حدّ). */
export function clampYear(y: number): number {
  return Math.min(MAX_YEAR, Math.max(MIN_YEAR, y));
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** بناء "YYYY-MM-DD" من أجزاء رقمية. m بين 1 و12. بلا Date. */
export function ymd(y: number, m: number, d: number): string {
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

/** تقسيم "YYYY-MM-DD" إلى أرقام. بلا تحليل Date. */
export function parseYMD(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m, d };
}

export function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

export function daysInMonth(y: number, m: number): number {
  const table = [31, isLeapYear(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return table[m - 1];
}

/** خوارزمية Sakamoto — حساب صحيح صرف مستقل عن المنطقة الزمنية. 0=الأحد .. 6=السبت. m بين 1 و12. */
export function dayOfWeek(y: number, m: number, d: number): number {
  const t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
  const yy = m < 3 ? y - 1 : y;
  return (yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) + t[m - 1] + d) % 7;
}

/** المقارنة النصية تعمل زمنيًا لصيغة "YYYY-MM-DD". */
export function compareISO(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

const KW_TODAY_FMT = new Intl.DateTimeFormat('en-CA', { timeZone: KUWAIT_TZ });
/** «اليوم» بتوقيت الكويت كـ "YYYY-MM-DD". العميل فقط (لا يُستدعى أثناء SSR/التصدير). */
export function todayInKuwait(): string {
  return KW_TODAY_FMT.format(new Date());
}

/** إزاحة زوج (سنة، شهر) بعدد أشهر. m بين 1 و12. */
export function shiftMonth(y: number, m: number, delta: number): { y: number; m: number } {
  const zeroIdx = y * 12 + (m - 1) + delta;
  return { y: Math.floor(zeroIdx / 12), m: (((zeroIdx % 12) + 12) % 12) + 1 };
}

/** مفتاح الشهر "YYYY-MM" للنوت العام. */
export function monthKey(y: number, m: number): string {
  return `${y}-${pad2(m)}`;
}

export function formatMonthTitle(y: number, m: number, lang: Lang = 'ar'): string {
  return `${(lang === 'en' ? EN_MONTHS : AR_MONTHS)[m - 1]} ${y}`;
}
