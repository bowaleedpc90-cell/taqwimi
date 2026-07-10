import type { Category, HolidayType } from './types';

export const KUWAIT_TZ = 'Asia/Kuwait';
export const STORAGE_KEY = 'taqwimi.v1';

// أسماء الأشهر الميلادية (بدون Intl → لا يوجد كائن Date)
export const AR_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

// أسماء الأشهر الهجرية، الفهرس 0 = محرّم .. 11 = ذو الحجة
export const AR_HIJRI_MONTHS = [
  'محرّم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة',
  'رجب', 'شعبان', 'رمضان', 'شوّال', 'ذو القعدة', 'ذو الحجة',
];

// أسماء الأيام، الفهرس 0 = الأحد .. 6 = السبت
export const AR_WEEKDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
export const AR_WEEKDAYS_SHORT = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
// حرف واحد مميّز لكل يوم (عرض السنة) — لا تصادم بين الأحد والأربعاء. الفهرس 0 = الأحد
export const AR_WEEKDAYS_LETTER = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];

// المقابل الإنجليزي (للوضع الإنجليزي LTR) — نفس الترتيب (الميلادي، الأحد=0)
export const EN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
export const EN_WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const EN_WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const EN_WEEKDAYS_LETTER = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
export const EN_HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabiʿ I', 'Rabiʿ II', 'Jumada I', 'Jumada II',
  'Rajab', 'Shaʿban', 'Ramadan', 'Shawwal', 'Dhu al-Qiʿdah', 'Dhu al-Hijjah',
];

export const CATEGORY_ORDER: Category[] = ['event', 'birthday', 'leave', 'work', 'other'];

export const CATEGORIES: Record<Category, { label: string; emoji: string; color: string }> = {
  event: { label: 'مناسبة', emoji: '🎉', color: '#2563EB' },
  birthday: { label: 'عيد ميلاد', emoji: '🎂', color: '#DB2777' },
  leave: { label: 'إجازة', emoji: '🌴', color: '#16A34A' },
  work: { label: 'عمل', emoji: '💼', color: '#B7791F' },
  other: { label: 'أخرى', emoji: '📝', color: '#5B6472' },
};

// ألوان جاهزة لمنتقي اللون الاختياري
export const COLOR_SWATCHES = ['#2563EB', '#DB2777', '#16A34A', '#B7791F', '#7C3AED', '#DC2626', '#0891B2', '#5B6472'];

export const HOLIDAY_TYPE_LABEL: Record<HolidayType, string> = {
  national: 'عطلة وطنية',
  government: 'عطلة رسمية',
  religious: 'مناسبة دينية',
  custom: 'عطلة خاصة',
};

// مصدر موحّد لألوان أنواع العطل — تُشتق منه الشاشة (DayCell)، الطباعة (PrintMonth)،
// والإدارة/ورقة اليوم (TINT) حتى لا تنحرف الألوان بين الشاشة والطباعة.
export const HOLIDAY_TYPE_BG: Record<HolidayType, string> = {
  national: 'bg-national-soft',
  government: 'bg-gold-soft',
  religious: 'bg-religious-soft',
  custom: 'bg-subtle', // قابل للقلب (فاتح نهارًا، تدرّج داكن ليلاً) — يبقى رقم اليوم واضحًا
};
export const HOLIDAY_TYPE_TEXT: Record<HolidayType, string> = {
  national: 'text-national',
  government: 'text-gold',
  religious: 'text-religious',
  custom: 'text-heading',
};
// خلفية + نص معًا (للشارات في الإدارة وورقة اليوم).
export const HOLIDAY_TYPE_TINT: Record<HolidayType, string> = {
  national: `${HOLIDAY_TYPE_BG.national} ${HOLIDAY_TYPE_TEXT.national}`,
  government: `${HOLIDAY_TYPE_BG.government} ${HOLIDAY_TYPE_TEXT.government}`,
  religious: `${HOLIDAY_TYPE_BG.religious} ${HOLIDAY_TYPE_TEXT.religious}`,
  custom: `${HOLIDAY_TYPE_BG.custom} ${HOLIDAY_TYPE_TEXT.custom}`,
};
