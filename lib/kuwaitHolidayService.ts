import seed2026 from '../data/kuwait-holidays-2026.json';
import { compareISO, daysInMonth, pad2, ymd } from './dateUtils';
import type { Holiday, HolidayType } from './types';

interface SeedFile {
  year: number;
  source?: string;
  holidays: Holiday[];
}

// السنوات المُنسّقة يدويًا والمُتحقَّق منها تُقدَّم على المولّد التلقائي.
const SEED_BY_YEAR: Record<number, Holiday[]> = {
  2026: (seed2026 as SeedFile).holidays,
};

// أعياد ميلادية ثابتة (نفس التاريخ كل سنة).
const FIXED: { nameAr: string; nameEn: string; m: number; d: number; type: HolidayType }[] = [
  { nameAr: 'رأس السنة الميلادية', nameEn: "New Year's Day", m: 1, d: 1, type: 'government' },
  { nameAr: 'العيد الوطني', nameEn: 'National Day', m: 2, d: 25, type: 'national' },
  { nameAr: 'عيد التحرير', nameEn: 'Liberation Day', m: 2, d: 26, type: 'national' },
];

// (شهر هجري، يوم هجري، اسم عربي، اسم إنجليزي) — أساس islamic-civil / العجيري.
const HIJRI_HOLIDAYS: [number, number, string, string][] = [
  [1, 1, 'رأس السنة الهجرية', 'Islamic New Year'],
  [3, 12, 'المولد النبوي الشريف', "Prophet's Birthday"],
  [7, 27, 'الإسراء والمعراج', "Isra & Mi'raj"],
  [10, 1, 'عيد الفطر', 'Eid al-Fitr'],
  [10, 2, 'عيد الفطر - ثاني أيام العيد', 'Eid al-Fitr (Day 2)'],
  [10, 3, 'عيد الفطر - ثالث أيام العيد', 'Eid al-Fitr (Day 3)'],
  [12, 9, 'وقفة عرفات', 'Arafah Day'],
  [12, 10, 'عيد الأضحى', 'Eid al-Adha'],
  [12, 11, 'عيد الأضحى - ثاني أيام العيد', 'Eid al-Adha (Day 2)'],
  [12, 12, 'عيد الأضحى - ثالث أيام العيد', 'Eid al-Adha (Day 3)'],
];

const ESTIMATED_NOTE = 'تقديري — يعتمد على رؤية الهلال';

// نثبّت التاريخ عند منتصف نهار UTC ونهيّئ بـ UTC → توليد متطابق على كل الأجهزة.
const HIJRI_FMT = new Intl.DateTimeFormat('en-u-ca-islamic-civil', {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

function generateHolidays(year: number): Holiday[] {
  const out: Holiday[] = FIXED.map((f) => ({
    id: `${f.type}-${ymd(year, f.m, f.d)}`,
    nameAr: f.nameAr,
    nameEn: f.nameEn,
    gregorianDate: ymd(year, f.m, f.d),
    type: f.type,
    isConfirmed: true,
    isEstimated: false,
  }));

  for (let m = 1; m <= 12; m++) {
    const dim = daysInMonth(year, m);
    for (let d = 1; d <= dim; d++) {
      const dt = new Date(Date.UTC(year, m - 1, d, 12));
      const parts = HIJRI_FMT.formatToParts(dt);
      const hm = Number(parts.find((p) => p.type === 'month')?.value);
      const hd = Number(parts.find((p) => p.type === 'day')?.value);
      const hy = Number(parts.find((p) => p.type === 'year')?.value);
      for (const [mm, dd, nameAr, nameEn] of HIJRI_HOLIDAYS) {
        if (mm === hm && dd === hd) {
          out.push({
            id: `religious-${ymd(year, m, d)}`,
            nameAr,
            nameEn,
            gregorianDate: ymd(year, m, d),
            hijriDate: `${hy}-${pad2(hm)}-${pad2(hd)}`,
            type: 'religious',
            isConfirmed: false,
            isEstimated: true,
            notes: ESTIMATED_NOTE,
          });
        }
      }
    }
  }

  out.sort((a, b) => compareISO(a.gregorianDate, b.gregorianDate));
  return out;
}

const yearCache = new Map<number, Holiday[]>();

/** كل عطل السنة (2026 من JSON المُتحقَّق؛ غيرها مُولَّدة). */
export function getHolidaysForYear(year: number): Holiday[] {
  const cached = yearCache.get(year);
  if (cached) return cached;
  const list = SEED_BY_YEAR[year] ?? generateHolidays(year);
  yearCache.set(year, list);
  return list;
}

/** خريطة gregorianDate -> Holiday لسنة، مع دمج العطل الخاصة للمستخدم. */
export function holidayMap(year: number, custom: Holiday[] = []): Map<string, Holiday> {
  const map = new Map<string, Holiday>();
  for (const h of getHolidaysForYear(year)) map.set(h.gregorianDate, h);
  for (const h of custom) {
    if (h.gregorianDate.startsWith(`${year}-`)) map.set(h.gregorianDate, h);
  }
  return map;
}

export function getHolidayForDate(iso: string, custom: Holiday[] = []): Holiday | undefined {
  const year = Number(iso.slice(0, 4));
  return holidayMap(year, custom).get(iso);
}

export function getHolidaysForMonth(year: number, month: number, custom: Holiday[] = []): Holiday[] {
  const prefix = `${year}-${pad2(month)}`;
  const base = getHolidaysForYear(year).filter((h) => h.gregorianDate.startsWith(prefix));
  const cust = custom.filter((h) => h.gregorianDate.startsWith(prefix));
  return [...base, ...cust].sort((a, b) => compareISO(a.gregorianDate, b.gregorianDate));
}
