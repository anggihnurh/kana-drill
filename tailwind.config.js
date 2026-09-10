/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // shadcn-style black/white semantic tokens
        background: '#09090b',
        surface: '#0a0a0a',
        'surface-elevated': '#111111',
        border: '#27272a',
        muted: '#71717a',
        'muted-foreground': '#a1a1aa',
        // Primary = zinc/white (shadcn style — no indigo accent)
        primary: {
          DEFAULT: '#18181b',   // zinc-900
          foreground: '#fafafa',
          hover: '#27272a',
          light: '#3f3f46',
        },
        // Semantic state palettes — tetap berwarna
        success: {
          DEFAULT: '#10b981',
          foreground: '#ffffff',
          light: '#34d399',
          dark: '#064e3b',
        },
        danger: {
          DEFAULT: '#f43f5e',
          foreground: '#ffffff',
          light: '#fb7185',
          dark: '#4c0519',
        },
        amber: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#78350f',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        japanese: ['"Noto Sans JP"', '"Hiragino Sans"', '"Yu Gothic"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px -3px rgba(255, 255, 255, 0.1)' },
          '50%': { boxShadow: '0 0 25px 3px rgba(255, 255, 255, 0.18)' },
        },
        emeraldGlow: {
          '0%, 100%': { boxShadow: '0 0 15px -3px rgba(16, 185, 129, 0.3)' },
          '50%': { boxShadow: '0 0 25px 3px rgba(16, 185, 129, 0.6)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-5px)' },
          '40%, 80%': { transform: 'translateX(5px)' },
        },
        popIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceCombo: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15) rotate(2deg)' },
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'emerald-glow': 'emeraldGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shake': 'shake 0.28s ease-in-out',
        'pop-in': 'popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'combo-bounce': 'bounceCombo 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }
    },
  },
  plugins: [],
};
