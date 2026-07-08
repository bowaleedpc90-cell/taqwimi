// أنواع مشتركة عبر التطبيق

export type HolidayType = 'national' | 'religious' | 'government' | 'custom';

export interface Holiday {
  id: string;
  nameAr: string;
  nameEn: string;
  gregorianDate: string; // "YYYY-MM-DD"
  hijriDate?: string;    // "1447-07-27"
  type: HolidayType;
  isConfirmed: boolean;
  isEstimated: boolean;
  notes?: string;
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
  version: 1;
  settings: Settings;
  items: DayItem[];                      // كل الإضافات (مسطّحة)
  dayNotes: Record<string, string>;      // iso -> نص النوت داخل اليوم
  generalNotes: Record<string, string>;  // "YYYY-MM" -> نص النوت العام
  customHolidays: Holiday[];             // عطل خاصة يضيفها المستخدم
}
