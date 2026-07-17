import type { Metadata, Viewport } from 'next';
import { Cairo, Tajawal } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LanguageProvider } from '@/components/LanguageProvider';
import { AppStateProvider } from '@/components/AppStateProvider';
import { AppShell } from '@/components/AppShell';

const cairo = Cairo({
  subsets: ['arabic'],
  variable: '--font-cairo',
  display: 'swap',
});

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  variable: '--font-tajawal',
  display: 'swap',
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const metadata: Metadata = {
  title: 'تقويمي — رزنامة كويتية ذكية',
  description:
    'أنشئ رزنامتك الكويتية المخصّصة، أضف مناسباتك ونوتاتك، والعطل الرسمية تظهر تلقائيًا — اطبعها على A4 أو استخدمها على هاتفك.',
  applicationName: 'تقويمي',
  manifest: `${basePath}/manifest.webmanifest`,
  icons: {
    icon: [
      { url: `${basePath}/favicon.ico`, sizes: '32x32' },
      { url: `${basePath}/icon.svg`, type: 'image/svg+xml' },
      { url: `${basePath}/icon-192.png`, sizes: '192x192', type: 'image/png' },
      { url: `${basePath}/icon-512.png`, sizes: '512x512', type: 'image/png' },
    ],
    apple: `${basePath}/apple-touch-icon.png`,
    shortcut: `${basePath}/favicon.ico`,
  },
  appleWebApp: { capable: true, title: 'تقويمي', statusBarStyle: 'default' },
};

// ملاحظة (I3): أزلنا maximumScale/userScalable ليتمكّن المستخدم من تكبير الصفحة (وصولية).
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0B2A4A' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1117' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

// يُضبط قبل الرسم لمنع وميض السمة: يقرأ الاختيار المحفوظ، والافتراضي فاتح (نهاري)
// بغضّ النظر عن تفضيل النظام — المستخدم يبدّل للداكن يدويًا ويُحفظ اختياره.
const themeInit = `(function(){try{var t=localStorage.getItem('taqwimi.theme');if(t!=='light'&&t!=='dark'){t='light';}document.documentElement.dataset.theme=t;}catch(e){}})();`;

// يُضبط قبل الرسم لمنع وميض/انقلاب اللغة: يقرأ الاختيار المحفوظ، والافتراضي عربي (RTL).
// الإنجليزية تقلب الاتجاه إلى LTR.
const langInit = `(function(){try{var l=localStorage.getItem('taqwimi.lang');if(l!=='en'){l='ar';}document.documentElement.lang=l;document.documentElement.dir=l==='en'?'ltr':'rtl';}catch(e){}})();`;

// كسر التأطير: GitHub Pages لا يسمح برأس X-Frame-Options، و frame-ancestors
// يتجاهله المتصفح داخل <meta> — فهذا هو المتاح لمنع تأطير الموقع وخداع
// المستخدم لضغط إجراء مدمّر (تصفير البيانات). ليس بديلاً كاملاً عن الرأس.
const frameBust = `(function(){try{if(self!==top){top.location=self.location;}}catch(e){}})();`;

/**
 * CSP عبر <meta> — الاستضافة الثابتة (GitHub Pages) لا تسمح برؤوس مخصّصة.
 *
 * حدوده بصراحة — لا تُبالغ في الاعتماد عليه:
 * 1) Next.js يرفع وسوم <script> الخاصة به فوق هذا الوسم في <head>، والسياسة عبر
 *    <meta> تحكم ما يُجلب *بعد* تحليلها فقط — فحِزم التطبيق الأولى لا تحكمها
 *    (وهي أصلًا first-party على نفس الأصل، أي أن 'self' كان سيسمح بها).
 * 2) التصدير الثابت لا يدعم nonce (لا خادم)، و Next يحقن سكربتات inline للترطيب،
 *    فـ 'unsafe-inline' ضرورة — أي أن CSP هنا *لا* يوقف تنفيذ سكربت مُحقَن inline.
 *
 * ما يوقفه فعلًا (وهو سبب بقائه): تنفيذ زمن التشغيل — تحميل سكربت من أصل خارجي،
 * وتسريب البيانات عبر fetch/XHR (connect-src) أو إرسال نموذج (form-action)،
 * وخطف base-uri، و object/embed. أي أن قيمته الأساسية: منع *خروج* البيانات.
 *
 * frame-ancestors غير مُدرج عمدًا: المتصفح يتجاهله داخل <meta> (يحتاج رأسًا حقيقيًا).
 * الإغلاق الكامل (CSP كرأس + frame-ancestors + HSTS) يحتاج بروكسي مثل Cloudflare.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  // لا نماذج في التطبيق إطلاقًا؛ لو أُضيف <form> يومًا لازم تعديل هذه السياسة.
  "form-action 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  // لا توجد data: URIs في المخرَج — فلا نمنحها صلاحية بلا داعٍ.
  "img-src 'self'",
  "font-src 'self'",
  "connect-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
].join('; ');

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${cairo.variable} ${tajawal.variable}`}>
      <head>
        <meta httpEquiv="Content-Security-Policy" content={csp} />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: frameBust }} />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <script dangerouslySetInnerHTML={{ __html: langInit }} />
        <LanguageProvider>
          <ThemeProvider>
            <AppStateProvider>
              <AppShell>{children}</AppShell>
            </AppStateProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
