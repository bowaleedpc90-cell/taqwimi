/** @type {import('next').NextConfig} */

// «تقويمي» يُنشر على GitHub Pages من مستودعه الخاص، فيُخدَم تحت مسار اسم المستودع
// (‎/taqwimi‎). يمكن تجاوزه عبر NEXT_PUBLIC_BASE_PATH (مثلاً "" للتشغيل المحلي على الجذر).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/taqwimi';

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
