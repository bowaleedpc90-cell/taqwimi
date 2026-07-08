import seed2026 from '../data/kuwait-holidays-2026.json';
import { compareISO, daysInMonth, pad2, ymd } from './dateUtils';
import type { AppState, Holiday, HolidayType } from './types';

interface SeedFile {
  year: number;
  source?: string;
  holidays: Holiday[];
}

// السنوات المُنسّقة يدويًا والمُتحقَّق منها تُقدَّم على المولّد التلقائي.
const SEED_BY_YEAR: Record<number, Holiday[]> = {
  2026: (seed2026 as SeedFile).holidays,
};

// أعياد ميلادية ثابتة (نفس التاريخ كل سنة) — slug ثابت مستقل عن السنة.
const FIXED: { slug: string; nameAr: string; nameEn: string; m: number; d: number; type: HolidayType }[] = [
  { slug: 'new-year', nameAr: 'رأس السنة الميلادية', nameEn: "New Year's Day", m: 1, d: 1, type: 'government' },
  { slug: 'national-day', nameAr: 'العيد الوطني', nameEn: 'National Day', m: 2, d: 25, type: 'national' },
  { slug: 'liberation-day', nameAr: 'عيد التحرير', nameEn: 'Liberation Day', m: 2, d: 26, type: 'national' },
];

// المناسبات الهجرية — (slug، شهر هجري، يوم هجري، اسم). أساس التوليد islamic-civil (تقديري).
const HIJRI_HOLIDAYS: { slug: string; hm: number; hd: number; nameAr: string; nameEn: string }[] = [
  { slug: 'islamic-new-year', hm: 1, hd: 1, nameAr: 'رأس السنة الهجرية', nameEn: 'Islamic New Year' },
  { slug: 'prophet-birthday', hm: 3, hd: 12, nameAr: 'المولد النبوي الشريف', nameEn: "Prophet's Birthday" },
  { slug: 'isra-miraj', hm: 7, hd: 27, nameAr: 'الإسراء والمعراج', nameEn: "Isra & Mi'raj" },
  { slug: 'eid-fitr-1', hm: 10, hd: 1, nameAr: 'عيد الفطر', nameEn: 'Eid al-Fitr' },
  { slug: 'eid-fitr-2', hm: 10, hd: 2, nameAr: 'عيد الفطر - ثاني أيام العيد', nameEn: 'Eid al-Fitr (Day 2)' },
  { slug: 'eid-fitr-3', hm: 10, hd: 3, nameAr: 'عيد الفطر - ثالث أيام العيد', nameEn: 'Eid al-Fitr (Day 3)' },
  { slug: 'arafah', hm: 12, hd: 9, nameAr: 'وقفة عرفات', nameEn: 'Arafah Day' },
  { slug: 'eid-adha-1', hm: 12, hd: 10, nameAr: 'عيد الأضحى', nameEn: 'Eid al-Adha' },
  { slug: 'eid-adha-2', hm: 12, hd: 11, nameAr: 'عيد الأضحى - ثاني أيام العيد', nameEn: 'Eid al-Adha (Day 2)' },
  { slug: 'eid-adha-3', hm: 12, hd: 12, nameAr: 'عيد الأضحى - ثالث أيام العيد', nameEn: 'Eid al-Adha (Day 3)' },
];

const ESTIMATED_NOTE = 'تقديري — يعتمد على رؤية الهلال';

// نثبّت التاريخ عند منتصف نهار UTC ونهيّئ بـ UTC → توليد متطابق على كل الأجهزة.
const HIJRI_FMT = new Intl.DateTimeFormat('en-u-ca-islamic-civil', {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

/**
 * توليد عطل سنة (لغير 2026): الثوابت مؤكدة، والمناسبات الهجرية تقديرية على أساس
 * islamic-civil. تقديرية دائمًا → المستخدم يثبّتها لما تتأكد رسميًا (يعالج انزياح السنوات).
 */
function generateHolidays(year: number): Holiday[] {
  const out: Holiday[] = FIXED.map((f) => ({
    id: `${year}-${f.slug}`,
    slug: f.slug,
    nameAr: f.nameAr,
    nameEn: f.nameEn,
    gregorianDate: ymd(year, f.m, f.d),
    type: f.type,
    isConfirmed: true,
    isEstimated: false,
  }));

  const seenSlug = new Set<string>();
  for (let m = 1; m <= 12; m++) {
    const dim = daysInMonth(year, m);
    for (let d = 1; d <= dim; d++) {
      const dt = new Date(Date.UTC(year, m - 1, d, 12));
      const parts = HIJRI_FMT.formatToParts(dt);
      const hm = Number(parts.find((p) => p.type === 'month')?.value);
      const hd = Number(parts.find((p) => p.type === 'day')?.value);
      const hy = Number(parts.find((p) => p.type === 'year')?.value);
      for (const h of HIJRI_HOLIDAYS) {
        if (h.hm === hm && h.hd === hd) {
          const greg = ymd(year, m, d);
          // مناسبة قد تتكرر مرتين في سنة ميلادية واحدة (نادر): نميّز slug النسخة الثانية
          // بالتاريخ كي يبقى مفتاح التعديل ومفتاح React وتحديد النسخة فريدًا لكل ظهور.
          const dup = seenSlug.has(h.slug);
          seenSlug.add(h.slug);
          const slug = dup ? `${h.slug}-${greg}` : h.slug;
          out.push({
            id: `${year}-${slug}`,
            slug,
            nameAr: h.nameAr,
            nameEn: h.nameEn,
            gregorianDate: greg,
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

/** العطل الرسمية المضمّنة للسنة قبل أي تعديل من المستخدم (2026 من JSON؛ غيرها مُولَّدة). */
export function getBuiltInHolidaysForYear(year: number): Holiday[] {
  const cached = yearCache.get(year);
  if (cached) return cached;
  const list = SEED_BY_YEAR[year] ?? generateHolidays(year);
  yearCache.set(year, list);
  return list;
}

/** مفتاح تعديل العطلة الرسمية. */
export function overrideKey(year: number, slug: string): string {
  return `${year}-${slug}`;
}

/**
 * العطل الفعّالة للسنة: العطل المضمّنة بعد تطبيق تعديلات المستخدم (تعديل تاريخ/اسم/نوع،
 * حذف، تثبيت كمؤكّد) + العطل والمناسبات التي أضافها المستخدم.
 */
export function effectiveHolidaysForYear(year: number, state: AppState): Holiday[] {
  const overrides = state.holidayOverrides ?? {};
  const out: Holiday[] = [];

  for (const h of getBuiltInHolidaysForYear(year)) {
    const ov = h.slug ? overrides[overrideKey(year, h.slug)] : undefined;
    if (!ov) {
      out.push(h);
      continue;
    }
    if (ov.deleted) continue;
    out.push({
      ...h,
      gregorianDate: ov.gregorianDate ?? h.gregorianDate,
      nameAr: ov.nameAr ?? h.nameAr,
      type: ov.type ?? h.type,
      isEstimated: ov.confirmed ? false : h.isEstimated,
      isConfirmed: ov.confirmed ? true : h.isConfirmed,
    });
  }

  for (const c of state.customHolidays ?? []) {
    if (c.gregorianDate.startsWith(`${year}-`)) out.push({ ...c, isCustom: true });
  }

  out.sort((a, b) => compareISO(a.gregorianDate, b.gregorianDate));
  return out;
}

/** خريطة gregorianDate -> Holiday فعّالة للسنة. */
export function effectiveHolidayMap(year: number, state: AppState): Map<string, Holiday> {
  const map = new Map<string, Holiday>();
  for (const h of effectiveHolidaysForYear(year, state)) map.set(h.gregorianDate, h);
  return map;
}

export function getEffectiveHolidayForDate(iso: string, state: AppState): Holiday | undefined {
  const year = Number(iso.slice(0, 4));
  return effectiveHolidayMap(year, state).get(iso);
}

export function effectiveHolidaysForMonth(year: number, month: number, state: AppState): Holiday[] {
  const prefix = `${year}-${pad2(month)}`;
  return effectiveHolidaysForYear(year, state).filter((h) => h.gregorianDate.startsWith(prefix));
}
