import { AR_HIJRI_MONTHS, EN_HIJRI_MONTHS } from './constants';
import { daysInMonth } from './dateUtils';
import type { Lang } from './types';

// نفس أساس خدمة العطل: islamic-civil مثبّت عند منتصف نهار UTC → نتيجة متطابقة على كل جهاز.
// ملاحظة: هذا حساب رقمي بـ Date.UTC (ليس تحليل نص "YYYY-MM-DD")، فلا يخالف قواعد التواريخ.
const HIJRI_FMT = new Intl.DateTimeFormat('en-u-ca-islamic-civil', {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

function hijriOf(y: number, m: number, d: number): { hm: number; hy: number } {
  const parts = HIJRI_FMT.formatToParts(new Date(Date.UTC(y, m - 1, d, 12)));
  return {
    hm: Number(parts.find((p) => p.type === 'month')?.value),
    hy: Number(parts.find((p) => p.type === 'year')?.value),
  };
}

/**
 * تسمية الأشهر الهجرية المقابلة لشهر ميلادي، مثل «محرّم ١٤٤٨» أو «محرّم – صفر ١٤٤٨»
 * أو عبر سنتين «ذو الحجة ١٤٤٧ – محرّم ١٤٤٨». تقريبية (تقويم حسابي).
 * نأخذ عدّة عيّنات خلال الشهر كي نلتقط أي شهر هجري أوسط (شهر ميلادي قد يلامس ٣ أشهر هجرية).
 */
export function hijriMonthLabel(year: number, month: number, lang: Lang = 'ar'): string {
  const names = lang === 'en' ? EN_HIJRI_MONTHS : AR_HIJRI_MONTHS;
  const dim = daysInMonth(year, month);
  const samples = [1, 5, 10, 15, 20, 25, dim];
  const seen: { hy: number; hm: number }[] = [];
  for (const d of samples) {
    const { hy, hm } = hijriOf(year, month, d);
    if (!seen.some((s) => s.hy === hy && s.hm === hm)) seen.push({ hy, hm });
  }
  // seen بترتيب زمني (العيّنات تصاعدية والهجري رتيب داخل الشهر) — نجمّع المتتالي حسب السنة.
  const groups: { hy: number; names: string[] }[] = [];
  for (const s of seen) {
    const name = names[s.hm - 1];
    const last = groups[groups.length - 1];
    if (last && last.hy === s.hy) last.names.push(name);
    else groups.push({ hy: s.hy, names: [name] });
  }
  return groups.map((g) => `${g.names.join(' – ')} ${g.hy}`).join(' – ');
}
