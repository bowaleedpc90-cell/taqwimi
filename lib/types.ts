// أنواع مشتركة عبر التطبيق

export type HolidayType = 'national' | 'religious' | 'government' | 'custom';

export interface Holiday {
  id: string;
  slug?: string;         // معرّف ثابت للعطلة الرسمية (مستقل عن التاريخ) — لتطبيق تعديلات المستخدم
  nameAr: string;
  nameEn: string;
  gregorianDate: string; // "YYYY-MM-DD"
  hijriDate?: string;    // "1447-07-27"
  type: HolidayType;
  isConfirmed: boolean;
  isEstimated: boolean;
  notes?: string;
  isCustom?: boolean;    // true إذا أضافها المستخدم (وليست عطلة رسمية مضمّنة)
}

/**
 * تعديل يجريه المستخدم على عطلة رسمية مضمّنة، مفتاحه `${year}-${slug}`.
 * الحقول غير المحدّدة تبقى على قيمة العطلة الأصلية.
 */
export interface HolidayOverride {
  deleted?: boolean;        // إخفاء هذه العطلة الرسمية
  gregorianDate?: string;   // "YYYY-MM-DD" — تاريخ معدّل
  nameAr?: string;          // اسم معدّل
  type?: HolidayType;       // نوع معدّل
  confirmed?: boolean;      // ثبّتها المستخدم كمؤكّدة (تُزال شارة «تقديري»)
}

export type Category = 'event' | 'birthday' | 'leave' | 'work' | 'other';

// إضافة مخصّصة يضيفها المستخدم على يوم معيّن
export interface DayItem {
  id: string;
  date: string; // "YYYY-MM-DD"
  title: string;
  category: Category;
  color?: string;
  createdAt: number;
}

export interface Settings {
  weekStart: number;      // 0..6 (0 = الأحد، الافتراضي)
  weekendDows: number[];  // الافتراضي [5,6] = الجمعة + السبت
  showHolidays: boolean;  // العطل الرسمية (وطنية/حكومية)
  showReligious: boolean; // المناسبات الدينية (تقديرية)
  showNotes: boolean;     // النوتات + النقاط + النوت العام
}

export interface AppState {
  version: 2;
  settings: Settings;
  items: DayItem[];                              // كل الإضافات (مسطّحة)
  dayNotes: Record<string, string>;              // iso -> نص النوت داخل اليوم
  generalNotes: Record<string, string>;          // "YYYY-MM" -> نص النوت العام
  customHolidays: Holiday[];                     // عطل/مناسبات أضافها المستخدم
  holidayOverrides: Record<string, HolidayOverride>; // "YYYY-slug" -> تعديل على عطلة رسمية
}
