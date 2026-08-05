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
    },
  },
  plugins: [],
}

export default config
