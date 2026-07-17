import {
  AR_HIJRI_MONTHS,
  AR_MONTHS,
  AR_WEEKDAYS,
  AR_WEEKDAYS_LETTER,
  AR_WEEKDAYS_SHORT,
  CATEGORIES,
  EN_HIJRI_MONTHS,
  EN_MONTHS,
  EN_WEEKDAYS,
  EN_WEEKDAYS_LETTER,
  EN_WEEKDAYS_SHORT,
  HOLIDAY_TYPE_LABEL,
} from './constants';
import type { Category, Holiday, HolidayType, Lang } from './types';

/**
 * i18n بنهج «النص العربي هو المفتاح»: العربية هي المصدر (تُعرض كما هي)، والإنجليزية
 * تأتي من خريطة EN أدناه؛ أي مفتاح غير مترجم يسقط إلى العربي (ظاهر لا مكسور).
 * الاستيفاء بعلامات {name}: t('لديك {n} يوم', { n: 5 }).
 */

export type { Lang } from './types';

export function translate(lang: Lang, key: string, params?: Record<string, string | number>): string {
  let out = lang === 'en' ? EN[key] ?? key : key;
  if (params) {
    for (const [k, v] of Object.entries(params)) out = out.split(`{${k}}`).join(String(v));
  }
  return out;
}

/* ------------------------------- تسميات مفهرسة (لغويّة) ------------------------------- */

export const monthNames = (lang: Lang): string[] => (lang === 'en' ? EN_MONTHS : AR_MONTHS);
export const weekdayNames = (lang: Lang): string[] => (lang === 'en' ? EN_WEEKDAYS : AR_WEEKDAYS);
export const weekdayShort = (lang: Lang): string[] => (lang === 'en' ? EN_WEEKDAYS_SHORT : AR_WEEKDAYS_SHORT);
export const weekdayLetter = (lang: Lang): string[] => (lang === 'en' ? EN_WEEKDAYS_LETTER : AR_WEEKDAYS_LETTER);
export const hijriMonths = (lang: Lang): string[] => (lang === 'en' ? EN_HIJRI_MONTHS : AR_HIJRI_MONTHS);

const CATEGORY_LABEL_EN: Record<Category, string> = {
  event: 'Event',
  birthday: 'Birthday',
  leave: 'Leave',
  work: 'Work',
  other: 'Other',
};
const HOLIDAY_TYPE_LABEL_EN: Record<HolidayType, string> = {
  national: 'National holiday',
  government: 'Official holiday',
  religious: 'Religious occasion',
  custom: 'Custom occasion',
};

export const categoryLabel = (lang: Lang, c: Category): string =>
  lang === 'en' ? CATEGORY_LABEL_EN[c] : CATEGORIES[c].label;
export const holidayTypeLabel = (lang: Lang, t: HolidayType): string =>
  lang === 'en' ? HOLIDAY_TYPE_LABEL_EN[t] : HOLIDAY_TYPE_LABEL[t];
/** اسم العطلة حسب اللغة (يسقط للعربي إن غاب الإنجليزي — مثل العطل المخصّصة). */
export const holidayName = (lang: Lang, h: Holiday): string =>
  lang === 'en' ? h.nameEn || h.nameAr : h.nameAr;

/* ------------------------------- خريطة الترجمة الإنجليزية ------------------------------- */
// المفتاح = النص العربي الحرفي كما في الكود. علامات {name} تُستوفى في translate.

export const EN: Record<string, string> = {
  // الرأس + التنقّل السفلي
  'شهري': 'Monthly',
  'السنة': 'Year',
  'الرزنامة': 'Calendar',
  'إضافاتي': 'My Additions',
  'الطباعة': 'Print',
  'الإعدادات': 'Settings',
  'اليوم': 'Today',
  'الشهر السابق': 'Previous month',
  'الشهر التالي': 'Next month',
  'هـ': 'AH',
  'التبديل إلى الوضع النهاري': 'Switch to light mode',
  'التبديل إلى الوضع الليلي': 'Switch to dark mode',
  'الوضع النهاري': 'Light mode',
  'الوضع الليلي': 'Dark mode',

  // مفتاح الرموز (Legend)
  'عطلة وطنية': 'National holiday',
  'مناسبة دينية': 'Religious occasion',
  'نهاية الأسبوع': 'Weekend',
  'يوجد نوتة': 'Has a note',
  'إجازة (تتبع ١٨٠)': 'Leave (180 tracking)',

  // النوتات
  'ملاحظات عامة على الشهر': 'General notes for the month',
  'اكتب ملاحظاتك هنا — ستظهر وتُطبع أسفل رزنامة هذا الشهر…':
    'Write your notes here — they appear and print below this month’s calendar…',
  'نوتة داخل اليوم': 'Note inside the day',
  'تظهر داخل خانة اليوم وتُطبع معه…': 'Shows inside the day cell and prints with it…',
  'نوت': 'Note',

  // ورقة اليوم / الإضافات
  'أضف مناسباتك ونوتة اليوم': 'Add your events and the day’s note',
  'إضافات هذا اليوم': 'This day’s additions',
  'إضافة جديدة': 'New addition',
  'تعديل الإضافة': 'Edit addition',
  'العنوان (مثال: اجتماع، عيد ميلاد أحمد…)': 'Title (e.g. Meeting, Ahmad’s birthday…)',
  'التصنيف': 'Category',
  'لون (اختياري)': 'Color (optional)',
  'حسب التصنيف': 'By category',
  'إضافة': 'Add',
  'حفظ التعديل': 'Save changes',
  'إلغاء': 'Cancel',
  'تعديل': 'Edit',
  'حذف': 'Delete',
  'مناسبة': 'Event',
  'عيد ميلاد': 'Birthday',
  'إجازة': 'Leave',
  'عمل': 'Work',
  'أخرى': 'Other',

  // تتبع ١٨٠ يوم
  'تتبع ١٨٠ يوم': '180-Day Tracking',
  'حالة الدوام': 'Work status',
  'دوام': 'Attended',
  'مرضية': 'Sick leave',
  'طارئة': 'Emergency leave',
  'اليوم بلا حالة يُحسب دوامًا تلقائيًا — حدّد نوع الإجازة فقط عند الغياب.':
    'A day with no status counts as attended automatically — set a leave type only when absent.',
  'يوم راحة أو عطلة رسمية — لا يدخل في حسبة الدوام.':
    'A weekend or official holiday — not counted toward attendance.',
  'إزالة الحالة المسجّلة سابقًا ({label})': 'Remove previously set status ({label})',
  '＋ تسجيل إجازة لعدة أيام من هذا اليوم': '＋ Log a multi-day leave from this day',
  'تسجيل إجازة لعدة أيام من هذا اليوم': 'Log a multi-day leave from this day',
  'من ١٨٠ يوم': 'of 180 days',
  'وضعك آمن': 'You’re safe',
  'انتبه': 'Caution',
  'خطر على الهدف': 'Goal at risk',
  'مبروك! حققت الهدف': 'Congrats! Goal reached',
  'متاح حتى نهاية السنة': 'Available till year-end',
  'متبقٍ للهدف': 'Left to goal',
  'رصيد الأمان': 'Safety margin',
  'أكملت أيام العمل المطلوبة لاستحقاق الأعمال الممتازة.':
    'You’ve completed the workdays required for the excellent-work bonus.',
  'بالوتيرة الحالية قد لا تصل إلى الهدف — راجع إجازاتك القادمة.':
    'At the current pace you may not reach the goal — review your upcoming leaves.',
  'لديك هامش أمان تقديري {n} يوم عمل قبل التأثير على الهدف.':
    'You have an estimated safety margin of {n} workdays before affecting the goal.',
  'هامش الأمان {n} يوم عمل فقط — راجع إجازاتك القادمة.':
    'Safety margin is only {n} workdays — review your upcoming leaves.',
  'هامش الأمان منخفض جدًا ({n} يوم عمل) — أي إجازة إضافية قد تؤثر على الهدف.':
    'Safety margin is very low ({n} workdays) — any extra leave could affect the goal.',
  'الأيام بلا حالة تُحسب دوامًا تلقائيًا — سجّل إجازة يوم بالضغط عليه، أو فترة كاملة من الزر أعلاه. حساب إرشادي وليس مستندًا رسميًا.':
    'Days with no status count as attended automatically — log a single day by tapping it, or a full period from the button above. Indicative estimate, not an official document.',
  '＋ تسجيل إجازة لعدة أيام': '＋ Log a multi-day leave',
  'تسجيل إجازة لعدة أيام': 'Log a multi-day leave',
  'اختر النوع وفترة الإجازة': 'Choose the type and leave period',
  'نوع الإجازة': 'Leave type',
  'من': 'From',
  'إلى': 'To',
  'اختر تاريخ البداية والنهاية.': 'Choose the start and end dates.',
  'سيتم تسجيل {n} يوم عمل ضمن الفترة — تُستثنى نهاية الأسبوع والعطل الرسمية.':
    '{n} workdays within the period will be logged — weekends and official holidays are excluded.',
  'لا توجد أيام عمل ضمن الفترة المختارة (كلها راحة أو عطل).':
    'No workdays within the selected period (all weekend or holidays).',
  'حفظ الفترة': 'Save period',
  'مسح الحالات في الفترة': 'Clear statuses in the period',

  // الإعدادات
  'مظهر داكن مريح للعين — يُحفظ على جهازك': 'A comfortable dark look — saved on your device',
  'العطل الرسمية': 'Official holidays',
  'عرض العطل الوطنية والحكومية على الرزنامة': 'Show national and government holidays on the calendar',
  'المناسبات الدينية': 'Religious occasions',
  'عرض الأعياد الدينية (تقديرية حسب رؤية الهلال)': 'Show religious occasions (estimated per moon sighting)',
  'الملاحظات': 'Notes',
  'عرض النوتات داخل الأيام والنوت العام أسفل الشهر': 'Show day notes and the general month note',
  'تتبع أيام دوامك لاستحقاق الأعمال الممتازة — لموظفي الجهات الحكومية':
    'Track your workdays toward the excellent-work bonus — for government employees',
  'إدارة العطل والمناسبات': 'Manage holidays & occasions',
  'عدّل تواريخ العطل، احذفها، أو أضف مناسبات خاصة': 'Edit holiday dates, delete them, or add custom occasions',
  'تصفير البيانات': 'Reset data',
  'حذف كل الإضافات والنوتات والإعدادات من هذا الجهاز. لا يمكن التراجع.':
    'Delete all additions, notes, and settings from this device. This cannot be undone.',
  'تصفير كل البيانات': 'Reset all data',
  'تأكيد الحذف': 'Confirm delete',
  'تقويمي — كل بياناتك محفوظة على جهازك فقط، بدون حساب أو خادم.':
    'تقويمي — all your data is saved on your device only, no account or server.',
  'تُخزَّن بنصّ صريح في متصفّح هذا الجهاز ولا تُرسَل لأي مكان — فلا تستخدم «تتبع ١٨٠ يوم» على جهاز مشترك.':
    'It is stored in plain text in this device’s browser and never sent anywhere — so avoid using 180-Day Tracking on a shared device.',
  'اللغة': 'Language',

  // العطل + الشارات
  'تقديري': 'Estimated',
  'الاسم': 'Name',
  'مثال: عيد الأضحى، إجازة خاصة…': 'e.g. Eid al-Adha, custom occasion…',
  'التاريخ (ميلادي)': 'Date (Gregorian)',
  'النوع': 'Type',
  'الاسم والتاريخ والنوع': 'Name, date, and type',
  'حفظ': 'Save',
  'استعادة الأصل': 'Restore original',
  'تاريخ العطلة الرسمية لازم يكون ضمن سنة {year}. لمناسبة في سنة أخرى استخدم «إضافة».':
    'An official holiday’s date must be within {year}. For an occasion in another year use “Add”.',
  'هذه المناسبة تقديرية (تعتمد على رؤية الهلال). عند تأكّدها رسميًا احفظها هنا لتثبيتها وإزالة شارة «تقديري».':
    'This occasion is estimated (depends on moon sighting). Once officially confirmed, save it here to fix it and remove the “Estimated” badge.',

  // التخزين + العلامة
  'التخزين غير متاح — لن تُحفظ تغييراتك. جرّب إيقاف وضع التصفّح الخاص أو أفرغ مساحة.':
    'Storage unavailable — your changes won’t be saved. Try disabling private browsing or free up space.',
  'تطوير وبرمجة': 'Developed by',
  'X Star Software على إنستغرام': 'X Star Software on Instagram',

  // مفاتيح إضافية من تحويل المكوّنات (خلية اليوم، الإضافات، إدارة العطل، الطباعة)
  'إجازة {label} — تتبع ١٨٠': 'Leave {label} — 180 tracking',
  'لون {c}': 'Color {c}',
  'أنجزت {done} من {target} يوم عمل': 'Completed {done} of {target} workdays',
  'سيتم تسجيل': 'Will log',
  'يوم عمل ضمن الفترة — تُستثنى نهاية الأسبوع والعطل الرسمية.':
    'workdays within the period — weekends and official holidays are excluded.',
  'رجوع': 'Back',
  'العطل بالكويت تتغيّر حسب قرارات الحكومة ورؤية الهلال. تقدر تعدّل تاريخ أي عطلة أو تحذفها أو تضيف مناسبة جديدة — وكل تغيير يُحفظ على جهازك وينعكس في الرزنامة والطباعة. المناسبات المستقبلية تظهر بشارة «تقديري» حتى تثبّتها.':
    'Holidays in Kuwait change with government decisions and moon sighting. You can edit any holiday’s date, delete it, or add a new occasion — every change is saved on your device and reflected in the calendar and print. Upcoming occasions show an “Estimated” badge until you confirm them.',
  'السنة السابقة': 'Previous year',
  'السنة التالية': 'Next year',
  'إضافة عطلة / مناسبة': 'Add holiday / occasion',
  'معدّلة': 'Edited',
  'محذوفة': 'Deleted',
  'تثبيت': 'Confirm',
  'استعادة': 'Restore',
  'استعادة العطل الرسمية': 'Restore official holidays',
  'يرجّع كل العطل الرسمية لسنة {n} لتواريخها الافتراضية ويلغي تعديلاتك عليها. لا يمسّ المناسبات التي أضفتها بنفسك.':
    'Restores all official holidays for {n} to their default dates and undoes your edits. Your own added occasions are untouched.',
  'استعادة عطل {n} الافتراضية': 'Restore {n} default holidays',
  'تأكيد الاستعادة': 'Confirm restore',
  'تاريخ العطلة الرسمية لازم يكون ضمن سنة {n}. لمناسبة في سنة أخرى استخدم «إضافة».':
    'An official holiday’s date must fall within {n}. For an occasion in another year, use “Add”.',
  'حذف العطلة': 'Delete holiday',
  'تعديل عطلة رسمية': 'Edit official holiday',
  'تعديل مناسبة': 'Edit occasion',
  'ما أضفت شي بعد. افتح الرزنامة واضغط على أي يوم لإضافة مناسبة أو نوتة.':
    'Nothing added yet. Open the calendar and tap any day to add an event or a note.',
  'افتح الرزنامة': 'Open the calendar',
  'المناسبات والإضافات ({n})': 'Events & additions ({n})',
  'افتح': 'Open',
  'نوتات الأيام ({n})': 'Day notes ({n})',
  'ملاحظات الأشهر ({n})': 'Month notes ({n})',
  'السنة الحالية': 'Current year',
  'طباعة السنة كاملة ({n})': 'Print the full year ({n})',
  'إغلاق': 'Close',
  'إعدادات الطباعة': 'Print settings',
  'الشهر المختار': 'Selected month',
  'السنة كاملة (١٢ صفحة)': 'Full year (12 pages)',
  'السابق': 'Previous',
  'التالي': 'Next',
  'حجم الورق': 'Paper size',
  'الاتجاه': 'Orientation',
  'عمودي': 'Portrait',
  'أفقي': 'Landscape',
  'طباعة الآن': 'Print now',
  'فعّل «طباعة الخلفيات/الألوان» (Background graphics) في نافذة الطباعة لظهور ألوان العطل.':
    'Enable “Background graphics” in the print dialog so holiday colors appear.',
  'ملاحظات: ': 'Notes: ',
  'وطنية': 'National',
  'رسمية': 'Official',
  'دينية': 'Religious',
  'خاصة': 'Custom',
};
