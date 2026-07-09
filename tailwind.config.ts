import type { Config } from 'tailwindcss';

// لون مشتق من متغيّر CSS بقنوات RGB — يدعم شفافية Tailwind (مثل bg-surface/45).
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './hooks/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-cairo)', 'var(--font-tajawal)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // navy/gold ألوان علامة ثابتة (تعبئة بنص أبيض/داكن) — لا تتبدّل بين الوضعين
        navy: {
          DEFAULT: '#0B2A4A',
          50: '#eef3f9',
          100: '#d6e2f0',
          700: '#123457',
          800: '#0d2c4b',
          900: '#0B2A4A',
        },
        gold: {
          DEFAULT: '#C9A227',
          light: '#E6C65B',
          soft: v('gold-soft'),
        },
        // ألوان قابلة للقلب حسب السمة (فاتح/داكن)
        heading: v('heading'),
        subtle: { DEFAULT: v('subtle'), hover: v('subtle-hover') },
        surface: v('surface'),
        canvas: v('canvas'),
        line: v('line'),
        muted: v('muted'),
        ink: v('ink'),
        weekend: v('weekend'),
        national: { DEFAULT: v('national'), soft: v('national-soft') },
        religious: { DEFAULT: v('religious'), soft: v('religious-soft') },
        danger: { DEFAULT: v('danger'), soft: v('danger-soft'), 'soft-hover': v('danger-soft-hover') },
      },
      borderRadius: {
        xl2: '1.1rem',
      },
      boxShadow: {
        sheet: '0 -8px 30px rgba(11, 42, 74, 0.18)',
        card: '0 1px 3px rgba(11, 42, 74, 0.08), 0 1px 2px rgba(11, 42, 74, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
