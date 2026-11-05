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
        admin: {
          sidebar: '#0f172a',
          primary: '#4f46e5',
          accent: '#6366f1',
        },
      },
    },
  },
  plugins: [],
};

export default config;

