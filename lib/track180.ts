import { isWeekendDow } from './calendarEngine';
import { compareISO, dayOfWeek, daysInMonth, parseYMD, ymd } from './dateUtils';
import { effectiveHolidayMap, getEffectiveHolidayForDate } from './kuwaitHolidayService';
import type { AppState, Track180LeaveType } from './types';

/**
 * محرك «تتبع ١٨٠ يوم» — استحقاق مكافأة الأعمال الممتازة لموظفي الجهات الحكومية بالكويت.
 *
 * النموذج خصمي: كل يوم عمل منقضٍ في السنة الميلادية الحالية يُحسب دوامًا تلقائيًا،
 * والمستخدم يسجّل الإجازات فقط (state.track180Days). يوم العمل = ليس نهاية أسبوع
 * (settings.weekendDows) وليس عطلة فعّالة — أي بعد تعديلات المستخدم من إدارة العطل
 * (effectiveHolidayMap)، بغضّ النظر عن مفاتيح «عرض» العطل لأن الإخفاء لا يغيّر الدوام.
 * الإجازة المسجّلة على يوم راحة/عطلة لا أثر لها. حساب إرشادي وليس مستندًا رسميًا.
 */

export const TRACK180_TARGET = 180;

/** عتبات حالة رصيد الأمان (بأيام العمل). */
export const TRACK180_THRESHOLDS = { safe: 20, warning: 10 };

export type Track180Status = 'safe' | 'warning' | 'danger';

export const TRACK180_LEAVE_TYPES: Record<Track180LeaveType, { label: string; emoji: string }> = {
  annual: { label: 'إجازة', emoji: '🌴' },
  sick: { label: 'مرضية', emoji: '🤒' },
  emergency: { label: 'طارئة', emoji: '⚡' },
  other: { label: 'أخرى', emoji: '📝' },
};

export const TRACK180_LEAVE_ORDER: Track180LeaveType[] = ['annual', 'sick', 'emergency', 'other'];

export interface Track180Stats {
  year: number;
  targetDays: number;
  /** أيام الدوام المحسوبة: أيام العمل المنقضية ناقص الإجازات (لا تنزل تحت صفر). */
  completedDays: number;
  /** نسبة مئوية مقرّبة — قد تتجاوز 100 بعد تحقيق الهدف. */
  percent: number;
  remainingToTarget: number;
  /** أيام العمل المتاحة من الغد حتى نهاية السنة، ناقص الإجازات المجدولة. */
  availableWorkDays: number;
  /** رصيد الأمان = المتاح − المتبقي للهدف (قد يكون سالبًا). */
  safetyBuffer: number;
  reachable: boolean;
  achieved: boolean;
  status: Track180Status;
}

/** حالة رصيد الأمان: آمن ≥ 20، انتبه ≥ 10، خطر أقل — الهدف المستحيل خطر، والمحقَّق آمن (الأقوى). */
export function track180Status(safetyBuffer: number, reachable: boolean, achieved: boolean): Track180Status {
  let status: Track180Status =
    safetyBuffer >= TRACK180_THRESHOLDS.safe ? 'safe' : safetyBuffer >= TRACK180_THRESHOLDS.warning ? 'warning' : 'danger';
  if (!reachable) status = 'danger';
  if (achieved) status = 'safe';
  return status;
}

/** هل اليوم يوم عمل يدخل في الحسبة؟ (ليس نهاية أسبوع ولا عطلة فعّالة بعد تعديلات المستخدم) */
export function isTrack180Workday(iso: string, state: AppState): boolean {
  const { y, m, d } = parseYMD(iso);
  if (isWeekendDow(dayOfWeek(y, m, d), state.settings.weekendDows)) return false;
  return getEffectiveHolidayForDate(iso, state) === undefined;
}

/** الحساب الكامل لسنة «اليوم» الميلادية (todayISO بتوقيت الكويت من useToday). */
export function computeTrack180(state: AppState, todayISO: string): Track180Stats {
  const year = Number(todayISO.slice(0, 4));
  const holidayByDate = effectiveHolidayMap(year, state);
  const weekendDows = state.settings.weekendDows;

  // اليوم نفسه على جهة «المنقضي» دائمًا؛ «المتاح» يبدأ من الغد (كقواعد التطبيق المرجعي).
  let elapsedWorking = 0;
  let elapsedLeave = 0;
  let futureWorking = 0;
  let futureLeave = 0;

  for (let m = 1; m <= 12; m++) {
    const dim = daysInMonth(year, m);
    for (let d = 1; d <= dim; d++) {
      if (isWeekendDow(dayOfWeek(year, m, d), weekendDows)) continue;
      const iso = ymd(year, m, d);
      if (holidayByDate.has(iso)) continue;
      const isLeave = state.track180Days[iso] !== undefined;
      if (compareISO(iso, todayISO) <= 0) {
        elapsedWorking++;
        if (isLeave) elapsedLeave++;
      } else {
        futureWorking++;
        if (isLeave) futureLeave++;
      }
    }
  }

  const completedDays = Math.max(0, elapsedWorking - elapsedLeave);
  const remainingToTarget = Math.max(0, TRACK180_TARGET - completedDays);
  const availableWorkDays = futureWorking - futureLeave;
  const safetyBuffer = availableWorkDays - remainingToTarget;
  const achieved = completedDays >= TRACK180_TARGET;
  const reachable = completedDays + availableWorkDays >= TRACK180_TARGET;

  return {
    year,
    targetDays: TRACK180_TARGET,
    completedDays,
    percent: Math.round((completedDays / TRACK180_TARGET) * 100),
    remainingToTarget,
    availableWorkDays,
    safetyBuffer,
    reachable,
    achieved,
    status: track180Status(safetyBuffer, reachable, achieved),
  };
}
