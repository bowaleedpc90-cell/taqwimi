# تقويمي — رزنامة كويتية ذكية

منصة رزنامة كويتية Mobile-first تتيح للموظفين والمواطنين إنشاء رزنامة مخصّصة، إضافة المناسبات والنوتات، وطباعتها على A4 أو استخدامها على الهاتف. العطل الرسمية الكويتية تظهر تلقائيًا.

يعيش هذا التطبيق في مجلد منفصل داخل مستودع `my-first-MVP` بدون المساس بتطبيق «١٨٠ يوم» في الجذر.

## الستاك

- **Next.js 15 (App Router) + TypeScript + Tailwind CSS**
- **date-fns** لأدوات التواريخ
- بدون قاعدة بيانات — كل شيء في `localStorage`
- RTL عربي كامل (`dir="rtl"`, `lang="ar"`)، خط Cairo

## قواعد التواريخ (صارمة)

- المنطقة الزمنية دائمًا **Asia/Kuwait** (UTC+3 ثابت، بلا توقيت صيفي).
- الأيام تُخزَّن كنصوص `YYYY-MM-DD` وتُقارن نصيًا — لا `new Date('YYYY-MM-DD')` ولا `toISOString()` للعرض.
- «اليوم» عبر `Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kuwait' })` على العميل فقط.
- اليوم من الأسبوع بخوارزمية **Sakamoto** (حساب صحيح صرف، مستقل عن المنطقة الزمنية).
- نهاية الأسبوع: الجمعة والسبت. بداية الأسبوع الافتراضية: الأحد (قابلة للتغيير).
- شبكة الشهر ثابتة **6×7**، وفي RTL أول يوم يبدأ من اليمين.

## البنية

```
lib/
  dateUtils.ts            أدوات نصية آمنة + todayInKuwait + Sakamoto
  calendarEngine.ts       بناء شبكة 6×7 RTL
  kuwaitHolidayService.ts  عطل الكويت (2026 من JSON، وباقي السنوات مُولّدة)
  printTemplateEngine.ts   نماذج طباعة الشهر/السنة
  storage.ts / types.ts / constants.ts
data/
  kuwait-holidays-2026.json  العطل المُتحقَّق منها رسميًا
hooks/                    useAppState (حفظ تلقائي)، useToday، useSwipe
components/               الرزنامة، الشبكة، الخانة، Bottom sheet، الطباعة، الإعدادات، …
app/                      / (شهري) · /year · /additions · /print · /settings
```

## التطوير

```bash
npm install
npm run dev      # http://localhost:3000/taqwimi  (أو NEXT_PUBLIC_BASE_PATH="" للجذر)
npm run test     # اختبارات وحدة للمحرّك والعطل
npm run build    # تصدير ثابت إلى out/
```

## النشر — GitHub Pages (مستودع مستقل)

«تقويمي» يُنشر من مستودعه الخاص على GitHub Pages، تمامًا مثل مشروع «١٨٠»، تحت المسار `‎/taqwimi/‎`.

الآلية تلقائية عبر `.github/workflows/deploy-pages.yml`: عند كل دفع إلى `main` يُبنى التطبيق (تصدير ثابت إلى `out/`) ويُنشر إلى فرع `gh-pages`.

خطوة واحدة لمرة واحدة بعد أول دفع: من **Settings → Pages** في المستودع، اختر **Deploy from a branch** ثم الفرع **`gh-pages`** والمجلد `/ (root)`.

الرابط بعدها: `https://bowaleedpc90-cell.github.io/taqwimi/`

التطبيق كامل على العميل (`localStorage`) وبدون خادم. لتشغيله محليًا على الجذر بدون مسار أساسي:

```bash
NEXT_PUBLIC_BASE_PATH="" npm run dev
```
