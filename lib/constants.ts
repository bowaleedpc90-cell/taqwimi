import type { Category, HolidayType } from './types';

export const KUWAIT_TZ = 'Asia/Kuwait';
export const STORAGE_KEY = 'taqwimi.v1';

// أسماء الأشهر الميلادية (بدون Intl → لا يوجد كائن Date)
export const AR_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

// أسماء الأيام، الفهرس 0 = الأحد .. 6 = السبت
export const AR_WEEKDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
export const AR_WEEKDAYS_SHORT = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

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

// خلفية/نص ناعمة حسب نوع العطلة — موحّدة عبر الشاشة والإدارة (ولاحقًا الطباعة).
export const HOLIDAY_TYPE_TINT: Record<HolidayType, string> = {
  national: 'bg-national-soft text-national',
  government: 'bg-gold-soft text-gold',
  religious: 'bg-religious-soft text-religious',
  custom: 'bg-navy-50 text-navy',
};
