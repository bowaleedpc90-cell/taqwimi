/* Service Worker أساسي لتقويمي — عمل دون اتصال.
   الصفحات: شبكة أولاً مع رجوع للكاش (محتوى محدّث + عمل offline).
   الأصول الثابتة: كاش أولاً (سريع). كل شيء على نفس الأصل فقط. */
// اسم الكاش مشتقّ من نسخة البناء (تُمرَّر عند التسجيل: sw.js?v=<buildId>).
// كل نشر يبدأ كاشًا جديدًا و activate يحذف القديم — فيوجد مسار إبطال طارئ
// بدل كاش أبدي لا يُفرَّغ. الرجوع إلى 'dev' عند غياب المعامل.
const VERSION = new URL(self.location.href).searchParams.get('v') || 'dev';
const CACHE = `taqwimi-${VERSION}`;

// نُخزّن قوقعة التطبيق مسبقًا داخل الكاش الجديد *قبل* أن يحذف activate الكاش القديم،
// وإلا لبقي المستخدم بلا كاش (وبلا عمل دون اتصال) بعد كل نشر حتى أول تحميل كامل.
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE);
        await cache.add(new Request(self.registration.scope, { cache: 'reload' }));
      } catch {
        /* الشبكة غير متاحة وقت التثبيت — نكمل، والكاش يمتلئ عند أول جلب */
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) {
        if (key !== CACHE) await caches.delete(key);
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  // تنقّل الصفحات: شبكة أولاً، ثم الكاش، ثم صفحة البداية المخزّنة
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        try {
          const res = await fetch(req);
          if (res && res.ok && !res.redirected) cache.put(req, res.clone());
          return res;
        } catch {
          return (
            (await cache.match(req)) ||
            (await cache.match(self.registration.scope)) ||
            Response.error()
          );
        }
      })(),
    );
    return;
  }

  // بقية الأصول: كاش أولاً ثم الشبكة (وتخزينها)
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const res = await fetch(req);
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      } catch {
        return cached || Response.error();
      }
    })(),
  );
});
