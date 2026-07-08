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
  getHolidaysForYear,
  getHolidaysForMonth,
  getHolidayForDate,
} from '../kuwaitHolidayService';

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
  assert.equal(dayOfWeek(2026, 2, 22), 0); // الأحد (يطابق اختبار المحرّك القديم)
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

  const inMonth = g.cells.filter((c) => c.inMonth);
  assert.equal(inMonth.length, 28);

  // اليوم الأول (الأحد) في الخانة 0 لأن weekStart=0 و firstDow=0
  assert.equal(g.cells[0].iso, ymd(2026, 2, 1));
  assert.equal(g.cells[0].day, 1);
  assert.equal(g.cells[0].dow, 0);
  // آخر يوم = 28 في الفهرس 27
  assert.equal(g.cells[27].day, 28);
  // خانات ما بعد 28 حشو
  assert.equal(g.cells[28].inMonth, false);

  // 25 و26 فبراير: الأربعاء/الخميس
  const d25 = g.cells.find((c) => c.iso === '2026-02-25')!;
  assert.equal(d25.dow, 3);
  assert.equal(d25.isWeekend, false);
});

test('buildMonthGrid — عطلة نهاية الأسبوع الجمعة والسبت', () => {
  const g = buildMonthGrid({ year: 2026, month: 2, weekStart: 0, todayISO: '' });
  const friday = g.cells.find((c) => c.iso === '2026-02-06')!; // 6 فبراير 2026 جمعة
  const saturday = g.cells.find((c) => c.iso === '2026-02-07')!;
  assert.equal(dayOfWeek(2026, 2, 6), 5);
  assert.equal(friday.isWeekend, true);
  assert.equal(saturday.isWeekend, true);
});

test('buildMonthGrid — بداية أسبوع السبت تزيح الحشو', () => {
  const g = buildMonthGrid({ year: 2026, month: 2, weekStart: 6, todayISO: '' });
  // firstDow=0 (أحد)، weekStart=6 (سبت) → lead = (0-6+7)%7 = 1
  assert.equal(g.cells[0].inMonth, false);
  assert.equal(g.cells[1].day, 1);
  assert.equal(g.cells.filter((c) => c.inMonth).length, 28);
});

test('getWeekdayLabels — يبدأ من weekStart', () => {
  assert.equal(getWeekdayLabels(0)[0], 'الأحد');
  assert.equal(getWeekdayLabels(6)[0], 'السبت');
});

test('getHolidaysForYear(2026) — 13 عطلة من JSON المُتحقَّق', () => {
  const hs = getHolidaysForYear(2026);
  assert.equal(hs.length, 13);
  const nat = getHolidaysForMonth(2026, 2);
  const d25 = nat.find((h) => h.gregorianDate === '2026-02-25')!;
  const d26 = nat.find((h) => h.gregorianDate === '2026-02-26')!;
  assert.equal(d25.type, 'national');
  assert.equal(d25.isConfirmed, true);
  assert.equal(d26.type, 'national');
  // الأعياد الدينية تقديرية
  const fitr = getHolidayForDate('2026-03-20')!;
  assert.equal(fitr.isEstimated, true);
  assert.equal(fitr.type, 'religious');
});

test('getHolidaysForYear(2027) — توليد تلقائي متطابق', () => {
  const hs = getHolidaysForYear(2027);
  // الثوابت موجودة ومؤكدة
  const nd = hs.find((h) => h.gregorianDate === '2027-02-25')!;
  assert.equal(nd.type, 'national');
  assert.equal(nd.isConfirmed, true);
  assert.equal(hs.find((h) => h.gregorianDate === '2027-01-01')?.nameAr, 'رأس السنة الميلادية');
  // توجد مناسبات دينية مُولّدة
  assert.equal(hs.some((h) => h.isEstimated && h.type === 'religious'), true);
  // كل التواريخ في 2027
  assert.equal(hs.every((h) => h.gregorianDate.startsWith('2027-')), true);
});

test('todayInKuwait — صيغة YYYY-MM-DD', () => {
  assert.match(todayInKuwait(), /^\d{4}-\d{2}-\d{2}$/);
});
