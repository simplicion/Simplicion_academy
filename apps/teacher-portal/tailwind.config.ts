import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--brand-primary, #2563eb)',
          'primary-hover': 'var(--brand-primary-hover, #1d4ed8)',
          accent: 'var(--brand-accent, #3b82f6)',
        },
      },
      borderRadius: {
        brand: 'var(--brand-radius, 8px)',
      },
      fontFamily: {
        brand: 'var(--brand-font, Inter, sans-serif)',
      },
    },
  },
  plugins: [],
};

export default config;

