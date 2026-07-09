/** @type {import('next').NextConfig} */

// «تقويمي» يُخدَم من جذر الدومين المخصّص taqwimi.xstarkw.com، فالمسار الأساسي فارغ ''.
// يمكن تجاوزه عبر NEXT_PUBLIC_BASE_PATH (مثلاً "/taqwimi" للنشر تحت مسار المستودع على github.io).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

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
  },
};

export default nextConfig;
