'use client';

/**
 * حدّ خطأ جذري: يلتقط الاستثناءات في الـ layout نفسه (حيث لا يعمل app/error.tsx).
 * يستبدل html/body كاملًا، فلا يعتمد على أنماط التطبيق ولا على مزوّدي السياق.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '24px',
          textAlign: 'center',
          background: '#F5F7FB',
          color: '#1C2333',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <span style={{ fontSize: 40 }} aria-hidden>
          ⚠️
        </span>
        <h1 style={{ margin: 0, fontSize: 18, color: '#0B2A4A' }}>صار خطأ غير متوقّع</h1>
        <p style={{ margin: 0, maxWidth: 360, fontSize: 14, lineHeight: 1.7, color: '#5B6472' }}>
          بياناتك محفوظة على جهازك ولم تُفقد.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: 8,
            minHeight: 48,
            padding: '0 24px',
            borderRadius: 14,
            border: 'none',
            background: '#0B2A4A',
            color: '#fff',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          إعادة المحاولة
        </button>
      </body>
    </html>
  );
}
