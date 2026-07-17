/** @type {import('next').NextConfig} */

// «تقويمي» يُخدَم من جذر الدومين المخصّص taqwimi.xstarkw.com، فالمسار الأساسي فارغ ''.
// يمكن تجاوزه عبر NEXT_PUBLIC_BASE_PATH (مثلاً "/taqwimi" للنشر تحت مسار المستودع على github.io).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

// معرّف البناء: يوسم كاش الـ Service Worker فيُفرَّغ القديم مع كل نشر.
// في CI نستخدم GITHUB_SHA، ومحليًا طابعًا زمنيًا.
const buildId = (process.env.GITHUB_SHA || '').slice(0, 7) || Date.now().toString(36);

const nextConfig = {
  reactStrictMode: true,
  // تصدير ثابت — التطبيق كامل على العميل (localStorage)، فيعمل على GitHub Pages وأي استضافة ثابتة.
  output: 'export',
  basePath: basePath || undefined,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_BUILD_ID: buildId,
  },
};

export default nextConfig;
