import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14161C',
        paper: '#EEF1EF',
        line: '#D7DBD8',
        muted: '#6B7280',
        teal: {
          DEFAULT: '#1F8A82',
          dark: '#166B65',
          light: '#E3F1EF',
        },
        amber: {
          DEFAULT: '#C98A1E',
          light: '#F7ECD8',
        },
        red: {
          DEFAULT: '#B23B3B',
          light: '#F5E4E4',
        },
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
