import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  dayOfWeek,
  daysInMonth,
  isLeapYear,
  shiftMonth,
  ymd,
  compareISO,
  todayInKuwait,
} from '../dateUtils';
import { buildMonthGrid, getWeekdayLabels } from '../calendarEngine';
import {
  getBuiltInHolidaysForYear,
  effectiveHolidaysForYear,
  effectiveHolidaysForMonth,
  getEffectiveHolidayForDate,
  effectiveHolidayMap,
} from '../kuwaitHolidayService';
import {
  setHolidayOverride,
  deleteBuiltInHoliday,
  restoreHoliday,
  restoreYearDefaults,
  confirmHoliday,
  addCustomHoliday,
  updateCustomHoliday,
  deleteCustomHoliday,
} from '../holidayActions';
import { buildPrintMonth } from '../printTemplateEngine';
import { hijriMonthLabel } from '../hijriUtils';
import { defaultState } from '../storage';

test('isLeapYear', () => {
  assert.equal(isLeapYear(2024), true);
  assert.equal(isLeapYear(2026), false);
  assert.equal(isLeapYear(2000), true);
  assert.equal(isLeapYear(1900), false);
});

test('daysInMonth — فبراير 2026 = 28 يوم', () => {
  assert.equal(daysInMonth(2026, 2), 28);
  assert.equal(daysInMonth(2024, 2), 29);
  assert.equal(daysInMonth(2026, 1), 31);
  assert.equal(daysInMonth(2026, 4), 30);
});

test('dayOfWeek — فبراير 2026 يبدأ الأحد (Sakamoto)', () => {
  assert.equal(dayOfWeek(2026, 2, 1), 0); // الأحد
  assert.equal(dayOfWeek(2026, 2, 22), 0); // الأحد
  assert.equal(dayOfWeek(2026, 2, 25), 3); // الأربعاء — العيد الوطني
});

test('shiftMonth — التفاف السنة', () => {
  assert.deepEqual(shiftMonth(2026, 1, -1), { y: 2025, m: 12 });
  assert.deepEqual(shiftMonth(2026, 12, 1), { y: 2027, m: 1 });
  assert.deepEqual(shiftMonth(2026, 6, 0), { y: 2026, m: 6 });
  assert.deepEqual(shiftMonth(2026, 1, -13), { y: 2024, m: 12 });
});

test('compareISO', () => {
  assert.equal(compareISO('2026-02-25', '2026-02-26'), -1);
  assert.equal(compareISO('2026-03-01', '2026-02-28'), 1);
  assert.equal(compareISO('2026-01-01', '2026-01-01'), 0);
});

test('buildMonthGrid — شبكة فبراير 2026 ثابتة 42 خانة، 28 يوم', () => {
  const g = buildMonthGrid({ year: 2026, month: 2, weekStart: 0, todayISO: '' });
  assert.equal(g.cells.length, 42);
  assert.equal(g.weeks.length, 6);
  assert.equal(g.weeks.every((w) => w.length === 7), true);
  assert.equal(g.cells.filter((c) => c.inMonth).length, 28);
  assert.equal(g.cells[0].iso, ymd(2026, 2, 1));
  assert.equal(g.cells[27].day, 28);
  assert.equal(g.cells[28].inMonth, false);
});

test('buildMonthGrid — عطلة نهاية الأسبوع الجمعة والسبت', () => {
  const g = buildMonthGrid({ year: 2026, month: 2, weekStart: 0, todayISO: '' });
  assert.equal(dayOfWeek(2026, 2, 6), 5);
  assert.equal(g.cells.find((c) => c.iso === '2026-02-06')!.isWeekend, true);
  assert.equal(g.cells.find((c) => c.iso === '2026-02-07')!.isWeekend, true);
});

test('buildMonthGrid — بداية أسبوع السبت تزيح الحشو', () => {
  const g = buildMonthGrid({ year: 2026, month: 2, weekStart: 6, todayISO: '' });
  assert.equal(g.cells[0].inMonth, false);
  assert.equal(g.cells[1].day, 1);
  assert.equal(g.cells.filter((c) => c.inMonth).length, 28);
});

test('getWeekdayLabels — يبدأ من weekStart', () => {
  assert.equal(getWeekdayLabels(0)[0], 'الأحد');
  assert.equal(getWeekdayLabels(6)[0], 'السبت');
});

test('عطل 2026 — 13 عطلة مضمّنة، بالتواريخ المصحّحة', () => {
  const hs = getBuiltInHolidaysForYear(2026);
  assert.equal(hs.length, 13);
  // التواريخ المصحّحة رسميًا
  assert.equal(hs.find((h) => h.slug === 'isra-miraj')!.gregorianDate, '2026-01-16');
  assert.equal(hs.find((h) => h.slug === 'islamic-new-year')!.gregorianDate, '2026-06-16');
  // لكل عطلة slug فريد
  assert.equal(new Set(hs.map((h) => h.slug)).size, 13);
});

test('عطل 2026 — الماضي مؤكّد (بلا «تقديري»)، المولد مستقبلي تقديري', () => {
  const st = defaultState();
  const fitr = getEffectiveHolidayForDate('2026-03-20', st)!;
  assert.equal(fitr.type, 'religious');
  assert.equal(fitr.isEstimated, false);
  assert.equal(fitr.isConfirmed, true);

  const isra = getEffectiveHolidayForDate('2026-01-16', st)!;
  assert.equal(isra.nameAr, 'الإسراء والمعراج');
  assert.equal(isra.isEstimated, false);

  const mawlid = getEffectiveHolidayForDate('2026-08-27', st)!;
  assert.equal(mawlid.isEstimated, true); // مستقبلي غير مؤكّد

  const national = getEffectiveHolidayForDate('2026-02-25', st)!;
  assert.equal(national.type, 'national');
});

test('توليد 2027 — الثوابت مؤكدة والدينية تقديرية دائمًا', () => {
  const hs = getBuiltInHolidaysForYear(2027);
  const nd = hs.find((h) => h.gregorianDate === '2027-02-25')!;
  assert.equal(nd.type, 'national');
  assert.equal(nd.isConfirmed, true);
  assert.equal(hs.find((h) => h.slug === 'new-year')!.gregorianDate, '2027-01-01');
  assert.equal(hs.some((h) => h.isEstimated && h.type === 'religious'), true);
  assert.equal(hs.every((h) => h.gregorianDate.startsWith('2027-')), true);
});

test('تعديل عطلة رسمية — تغيير التاريخ ينعكس في الخريطة الفعّالة', () => {
  let st = defaultState();
  st = setHolidayOverride(st, 2026, 'national-day', { gregorianDate: '2026-02-24' });
  const map = effectiveHolidayMap(2026, st);
  assert.equal(map.get('2026-02-24')!.slug, 'national-day');
  assert.equal(map.has('2026-02-25'), false); // انتقلت
});

test('حذف عطلة رسمية ثم استعادتها', () => {
  let st = defaultState();
  st = deleteBuiltInHoliday(st, 2026, 'new-year');
  assert.equal(effectiveHolidaysForYear(2026, st).length, 12);
  assert.equal(getEffectiveHolidayForDate('2026-01-01', st), undefined);
  st = restoreHoliday(st, 2026, 'new-year');
  assert.equal(effectiveHolidaysForYear(2026, st).length, 13);
  assert.equal(getEffectiveHolidayForDate('2026-01-01', st)!.slug, 'new-year');
});

test('تثبيت مناسبة تقديرية يزيل «تقديري»', () => {
  let st = defaultState();
  assert.equal(getEffectiveHolidayForDate('2026-08-27', st)!.isEstimated, true);
  st = confirmHoliday(st, 2026, 'prophet-birthday');
  const m = getEffectiveHolidayForDate('2026-08-27', st)!;
  assert.equal(m.isEstimated, false);
  assert.equal(m.isConfirmed, true);
});

test('إضافة/تعديل/حذف مناسبة خاصة', () => {
  let st = defaultState();
  st = addCustomHoliday(st, { nameAr: 'مناسبة عائلية', gregorianDate: '2026-07-10', type: 'custom' });
  let h = getEffectiveHolidayForDate('2026-07-10', st)!;
  assert.equal(h.nameAr, 'مناسبة عائلية');
  assert.equal(h.isCustom, true);
  assert.equal(effectiveHolidaysForMonth(2026, 7, st).length, 1);

  const id = st.customHolidays[0].id;
  st = updateCustomHoliday(st, id, { gregorianDate: '2026-07-11', nameAr: 'مناسبة محدّثة' });
  assert.equal(getEffectiveHolidayForDate('2026-07-10', st), undefined);
  assert.equal(getEffectiveHolidayForDate('2026-07-11', st)!.nameAr, 'مناسبة محدّثة');

  st = deleteCustomHoliday(st, id);
  assert.equal(getEffectiveHolidayForDate('2026-07-11', st), undefined);
});

test('استعادة عطل السنة الافتراضية تلغي التعديلات دون مسّ المخصّصة', () => {
  let st = defaultState();
  st = setHolidayOverride(st, 2026, 'national-day', { gregorianDate: '2026-02-24' });
  st = deleteBuiltInHoliday(st, 2026, 'new-year');
  st = addCustomHoliday(st, { nameAr: 'مناسبتي', gregorianDate: '2026-09-01', type: 'custom' });
  st = restoreYearDefaults(st, 2026);
  // العطل الرسمية عادت
  assert.equal(getEffectiveHolidayForDate('2026-02-25', st)!.slug, 'national-day');
  assert.equal(getEffectiveHolidayForDate('2026-01-01', st)!.slug, 'new-year');
  // المخصّصة باقية
  assert.equal(getEffectiveHolidayForDate('2026-09-01', st)!.nameAr, 'مناسبتي');
});

test('توليد السنوات — الـ slugs فريدة دائمًا (يعالج تكرار العطلة الهجرية في سنة)', () => {
  for (let yr = 2027; yr <= 2045; yr++) {
    const slugs = getBuiltInHolidaysForYear(yr).map((h) => h.slug);
    assert.equal(new Set(slugs).size, slugs.length, `slugs غير فريدة في ${yr}`);
  }
});

test('عطلة هجرية مكرّرة في سنة — حذف نسخة لا يمسّ الأخرى', () => {
  let doubledYear = 0;
  let dupName = '';
  for (let yr = 2027; yr <= 2045 && !doubledYear; yr++) {
    const byName: Record<string, number> = {};
    for (const h of getBuiltInHolidaysForYear(yr)) byName[h.nameAr] = (byName[h.nameAr] ?? 0) + 1;
    const dup = Object.entries(byName).find(([, n]) => n >= 2);
    if (dup) {
      doubledYear = yr;
      dupName = dup[0];
    }
  }
  assert.notEqual(doubledYear, 0, 'يفترض وجود سنة فيها عطلة هجرية مكرّرة ضمن المدى');
  const occ = getBuiltInHolidaysForYear(doubledYear).filter((h) => h.nameAr === dupName);
  assert.ok(occ.length >= 2);
  const st = deleteBuiltInHoliday(defaultState(), doubledYear, occ[0].slug!);
  const remaining = effectiveHolidaysForYear(doubledYear, st).filter((h) => h.nameAr === dupName);
  assert.equal(remaining.length, occ.length - 1); // انحذفت واحدة فقط
});

test('الطباعة — المناسبات الخاصة تظهر حتى مع إطفاء العطل الرسمية؛ الرسمية تُخفى', () => {
  let st = defaultState();
  st = { ...st, settings: { ...st.settings, showHolidays: false } };
  st = addCustomHoliday(st, { nameAr: 'مناسبتي', gregorianDate: '2026-07-10', type: 'custom' });
  const jul = buildPrintMonth(st, 2026, 7);
  assert.equal(jul.cells.find((c) => c.iso === '2026-07-10')!.holiday?.nameAr, 'مناسبتي');
  const jan = buildPrintMonth(st, 2026, 1);
  assert.equal(jan.cells.find((c) => c.iso === '2026-01-01')!.holiday, undefined); // رسمية مخفية
});

test('hijriMonthLabel — الحالات العادية (شهر/شهرين)', () => {
  assert.equal(hijriMonthLabel(2026, 2), 'شعبان – رمضان 1447');
  assert.equal(hijriMonthLabel(2026, 7), 'محرّم – صفر 1448');
});

test('hijriMonthLabel — شهر ميلادي يلامس ٣ أشهر هجرية لا يُسقط الأوسط', () => {
  const label = hijriMonthLabel(2035, 12);
  assert.ok(label.includes('شوّال'), `الأوسط مفقود: ${label}`);
  assert.ok(label.includes('رمضان') && label.includes('ذو القعدة'), label);
});

test('todayInKuwait — صيغة YYYY-MM-DD', () => {
  assert.match(todayInKuwait(), /^\d{4}-\d{2}-\d{2}$/);
});
