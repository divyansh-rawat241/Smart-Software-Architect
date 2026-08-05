import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: 'var(--brand)',
        'brand-strong': 'var(--brand-strong)',
        'brand-soft': 'var(--brand-soft)',
        surface: 'var(--surface)',
        'surface-strong': 'var(--surface-strong)',
        ink: 'var(--text)',
        muted: 'var(--text-muted)',
        success: 'var(--success)',
        danger: 'var(--danger)',
      },
      boxShadow: {
        soft: '0 18px 60px rgba(7, 19, 32, 0.12)',
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        rise: 'rise 500ms ease-out both',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        rise: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config

