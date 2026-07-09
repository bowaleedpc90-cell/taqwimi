import type { Metadata, Viewport } from 'next';
import { Cairo, Tajawal } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
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

// يُضبط قبل الرسم لمنع وميض السمة: يقرأ الاختيار المحفوظ أو تفضيل النظام.
const themeInit = `(function(){try{var t=localStorage.getItem('taqwimi.theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.dataset.theme=t;}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${cairo.variable} ${tajawal.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <ThemeProvider>
          <AppStateProvider>
            <AppShell>{children}</AppShell>
          </AppStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
