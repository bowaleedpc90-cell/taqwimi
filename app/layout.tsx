import type { Metadata, Viewport } from 'next';
import { Cairo, Tajawal } from 'next/font/google';
import './globals.css';
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
  icons: { icon: `${basePath}/icon.svg`, apple: `${basePath}/icon.svg` },
  appleWebApp: { capable: true, title: 'تقويمي', statusBarStyle: 'default' },
};

export const viewport: Viewport = {
  themeColor: '#0B2A4A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${tajawal.variable}`}>
      <body>
        <AppStateProvider>
          <AppShell>{children}</AppShell>
        </AppStateProvider>
      </body>
    </html>
  );
}
