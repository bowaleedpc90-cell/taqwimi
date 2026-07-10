import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  clearTrack180Range,
  computeTrack180,
  isTrack180Workday,
  setTrack180Range,
  track180Status,
  track180WorkdaysInRange,
  TRACK180_TARGET,
} from '../track180';
import { addCustomHoliday, deleteBuiltInHoliday } from '../holidayActions';
import { defaultState, loadState } from '../storage';
import type { AppState, Track180LeaveType } from '../types';

function stateWith(days: Record<string, Track180LeaveType> = {}): AppState {
  return { ...defaultState(), track180Days: days };
}

// 2026: عطل الكويت الرسمية المضمّنة 13 يومًا، منها 12 على أيام عمل (أحد–خميس)
// — 2026-01-18 (الإسراء والمعراج) يقع يوم أحد لكن 2026-03-21 (ثاني أيام الفطر) سبت.

test('track180Status — نفس عتبات المرجع: 20 آمن، 19/10 انتبه، 9 وسالب خطر', () => {
  assert.equal(track180Status(20, true, false), 'safe');
  assert.equal(track180Status(19, true, false), 'warning');
  assert.equal(track180Status(10, true, false), 'warning');
  assert.equal(track180Status(9, true, false), 'danger');
  assert.equal(track180Status(-3, true, false), 'danger');
  // الهدف المستحيل يفرض خطرًا، والمحقَّق يفرض أمانًا (الأقوى)
  assert.equal(track180Status(50, false, false), 'danger');
  assert.equal(track180Status(-10, false, true), 'safe');
});

test('isTrack180Workday — الأحد يوم عمل، الجمعة/السبت راحة، العطلة الفعّالة ليست يوم عمل', () => {
  const s = stateWith();
  assert.equal(isTrack180Workday('2026-07-05', s), true); // أحد
  assert.equal(isTrack180Workday('2026-07-03', s), false); // جمعة
  assert.equal(isTrack180Workday('2026-07-04', s), false); // سبت
  assert.equal(isTrack180Workday('2026-02-25', s), false); // العيد الوطني (أربعاء)
});

test('الهويات الأساسية — بلا إجازات: المنجز = أيام العمل المنقضية، والمعادلات متسقة', () => {
  const s = stateWith();
  const today = '2026-07-05'; // أحد
  const r = computeTrack180(s, today);
  assert.equal(r.year, 2026);
  assert.equal(r.targetDays, TRACK180_TARGET);
  assert.equal(r.remainingToTarget, Math.max(0, TRACK180_TARGET - r.completedDays));
  assert.equal(r.safetyBuffer, r.availableWorkDays - r.remainingToTarget);
  assert.equal(r.percent, Math.round((r.completedDays / TRACK180_TARGET) * 100));
  // ~26 أسبوعًا منقضيًا × 5 أيام عمل ناقص العطل — نطاق معقول
  assert.ok(r.completedDays > 100 && r.completedDays < 140, `completedDays=${r.completedDays}`);
  // مجموع المنقضي والمتاح ≈ أيام عمل السنة كلها (2026 بلا عطل ≈ 261 يوم أحد–خميس)
  const total = r.completedDays + r.availableWorkDays;
  assert.ok(total >= 245 && total <= 255, `total=${total}`);
});

test('إجازة ماضية على يوم عمل تنقص المنجز 1؛ ومجدولة مستقبلًا تنقص المتاح 1', () => {
  const today = '2026-07-05';
  const base = computeTrack180(stateWith(), today);
  const pastLeave = computeTrack180(stateWith({ '2026-06-14': 'annual' }), today); // أحد ماضٍ
  assert.equal(pastLeave.completedDays, base.completedDays - 1);
  assert.equal(pastLeave.availableWorkDays, base.availableWorkDays);
  const futureLeave = computeTrack180(stateWith({ '2026-09-06': 'sick' }), today); // أحد مستقبلي
  assert.equal(futureLeave.completedDays, base.completedDays);
  assert.equal(futureLeave.availableWorkDays, base.availableWorkDays - 1);
});

test('إجازة على راحة أسبوعية أو عطلة رسمية لا أثر لها (لا خصم مزدوج)', () => {
  const today = '2026-07-05';
  const base = computeTrack180(stateWith(), today);
  const r = computeTrack180(
    stateWith({ '2026-07-03': 'annual', '2026-02-25': 'emergency', '2026-03-21': 'other' }),
    today,
  ); // جمعة + العيد الوطني + سبت (ثاني أيام الفطر)
  assert.equal(r.completedDays, base.completedDays);
  assert.equal(r.availableWorkDays, base.availableWorkDays);
});

test('تكامل إدارة العطل — حذف عطلة رسمية يعيد يومها إلى الحسبة، وإضافة عطلة خاصة تخرجه', () => {
  const today = '2026-07-05';
  const base = computeTrack180(stateWith(), today);
  // حذف العيد الوطني (أربعاء ماضٍ) → يوم عمل إضافي منقضٍ
  const deleted = computeTrack180(deleteBuiltInHoliday(stateWith(), 2026, 'national-day'), today);
  assert.equal(deleted.completedDays, base.completedDays + 1);
  // إضافة عطلة خاصة على أحد مستقبلي → يوم عمل أقل في المتاح
  const added = computeTrack180(
    addCustomHoliday(stateWith(), { nameAr: 'عطلة اختبار', gregorianDate: '2026-09-06', type: 'custom' }),
    today,
  );
  assert.equal(added.availableWorkDays, base.availableWorkDays - 1);
});

test('اليوم نفسه على جهة المنقضي — إجازة اليوم تنقص المنجز لا المتاح', () => {
  const today = '2026-07-05'; // أحد
  const base = computeTrack180(stateWith(), today);
  const r = computeTrack180(stateWith({ [today]: 'annual' }), today);
  assert.equal(r.completedDays, base.completedDays - 1);
  assert.equal(r.availableWorkDays, base.availableWorkDays);
});

test('نهاية السنة — المتاح صفر، الهدف محقَّق والحالة آمنة والمتبقي صفر', () => {
  const r = computeTrack180(stateWith(), '2026-12-31');
  assert.equal(r.availableWorkDays, 0);
  assert.ok(r.achieved);
  assert.equal(r.status, 'safe');
  assert.equal(r.remainingToTarget, 0);
});

test('loadState — بلوب قديم بلا track180Days يُهاجَر إلى {} و track180=false', () => {
  // بلوب v2 مخزَّن قبل الميزة (بلا track180 في الإعدادات ولا track180Days)
  const old = {
    version: 2,
    settings: { weekStart: 0, weekendDows: [5, 6], showHolidays: true, showReligious: true, showNotes: true },
    items: [],
    dayNotes: {},
    generalNotes: {},
    customHolidays: [],
    holidayOverrides: {},
  };
  const g = globalThis as unknown as { window?: unknown };
  g.window = { localStorage: { getItem: () => JSON.stringify(old), setItem: () => {} } };
  try {
    const s = loadState();
    assert.deepEqual(s.track180Days, {});
    assert.equal(s.settings.track180, false);
  } finally {
    delete g.window;
  }
});

test('loadState — قيم track180Days المحفوظة تُقرأ كما هي', () => {
  const stored = {
    version: 2,
    settings: { weekStart: 0, weekendDows: [5, 6], showHolidays: true, showReligious: true, showNotes: true, track180: true },
    items: [],
    dayNotes: {},
    generalNotes: {},
    customHolidays: [],
    holidayOverrides: {},
    track180Days: { '2026-07-05': 'sick' },
  };
  const g = globalThis as unknown as { window?: unknown };
  g.window = { localStorage: { getItem: () => JSON.stringify(stored), setItem: () => {} } };
  try {
    const s = loadState();
    assert.equal(s.settings.track180, true);
    assert.deepEqual(s.track180Days, { '2026-07-05': 'sick' });
  } finally {
    delete g.window;
  }
});

test('track180WorkdaysInRange — يوم عمل واحد = 1', () => {
  assert.equal(track180WorkdaysInRange(stateWith(), '2026-07-05', '2026-07-05').length, 1);
});

test('track180WorkdaysInRange — أسبوع (أحد→سبت) = 5 (تُستثنى الجمعة/السبت)', () => {
  assert.equal(track180WorkdaysInRange(stateWith(), '2026-07-05', '2026-07-11').length, 5);
});

test('track180WorkdaysInRange — يستثني العطل الرسمية داخل الفترة', () => {
  // 23–27 فبراير: إثنين/ثلاثاء عمل، أربعاء(وطني)+خميس(تحرير) عطلة، جمعة راحة = 2
  assert.equal(track180WorkdaysInRange(stateWith(), '2026-02-23', '2026-02-27').length, 2);
});

test('track180WorkdaysInRange — يعكس ترتيب البداية/النهاية تلقائيًا', () => {
  assert.equal(track180WorkdaysInRange(stateWith(), '2026-07-11', '2026-07-05').length, 5);
});

test('track180WorkdaysInRange — فترة تعبر السنة تشمل أيامًا من السنتين وتستثني رأس السنة', () => {
  const days = track180WorkdaysInRange(stateWith(), '2026-12-30', '2027-01-04');
  assert.ok(days.some((d) => d.startsWith('2026-')));
  assert.ok(days.some((d) => d.startsWith('2027-')));
  assert.ok(!days.includes('2027-01-01')); // رأس السنة الميلادية عطلة
});

test('setTrack180Range — يعلّم أيام العمل فقط بالنوع المحدّد ولا يمسّ الراحة/العطل', () => {
  const s = setTrack180Range(stateWith(), 'sick', '2026-07-05', '2026-07-11');
  assert.equal(s.track180Days['2026-07-05'], 'sick'); // أحد
  assert.equal(s.track180Days['2026-07-09'], 'sick'); // خميس
  assert.equal(s.track180Days['2026-07-10'], undefined); // جمعة
  assert.equal(s.track180Days['2026-07-11'], undefined); // سبت
  assert.equal(Object.keys(s.track180Days).length, 5);
});

test('setTrack180Range — الأثر على العدّاد يساوي عدد أيام العمل المسجّلة', () => {
  const today = '2026-07-15';
  const base = computeTrack180(stateWith(), today);
  const s = setTrack180Range(stateWith(), 'annual', '2026-07-05', '2026-07-09'); // 5 أيام عمل ماضية
  assert.equal(computeTrack180(s, today).completedDays, base.completedDays - 5);
});

test('clearTrack180Range — يمسح الحالات داخل الفترة فقط', () => {
  const seeded = stateWith({ '2026-07-06': 'annual', '2026-07-08': 'sick', '2026-08-03': 'emergency' });
  const cleared = clearTrack180Range(seeded, '2026-07-01', '2026-07-31');
  assert.equal(cleared.track180Days['2026-07-06'], undefined);
  assert.equal(cleared.track180Days['2026-07-08'], undefined);
  assert.equal(cleared.track180Days['2026-08-03'], 'emergency'); // خارج الفترة يبقى
});

test('هدف مستحيل — كل أيام العمل إجازات ⇒ منجز 0، متاح 0، خطر', () => {
  // تعليم كل أيام 2026 كإجازة (غير أيام العمل تُتجاهل داخليًا)
  const days: Record<string, Track180LeaveType> = {};
  for (let m = 1; m <= 12; m++) {
    for (let d = 1; d <= 31; d++) {
      const iso = `2026-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days[iso] = 'annual';
    }
  }
  const r = computeTrack180(stateWith(days), '2026-07-05');
  assert.equal(r.completedDays, 0);
  assert.equal(r.availableWorkDays, 0);
  assert.equal(r.reachable, false);
  assert.equal(r.status, 'danger');
});
