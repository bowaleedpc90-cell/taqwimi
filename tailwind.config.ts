import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-cairo)', 'var(--font-tajawal)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // هوية «تقويمي»: أزرق داكن + أبيض + ذهبي، والعطل الوطنية بالأخضر
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
          soft: '#f6edcf',
        },
        national: {
          DEFAULT: '#15803D',
          soft: '#e5f4ea',
        },
        religious: {
          DEFAULT: '#B7791F',
          soft: '#fbf1dd',
        },
        surface: '#FFFFFF',
        canvas: '#F5F7FB',
        line: '#E6E9F0',
        muted: '#5B6472',
        ink: '#1C2333',
        weekend: '#eef1f6',
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
