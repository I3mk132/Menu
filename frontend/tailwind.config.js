/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // These resolve through CSS custom properties set per-theme in
        // src/index.css, so every theme gets its own palette without
        // touching component code. See src/styles/themes.js.
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        surfaceAlt: 'var(--color-surface-alt)',
        text: 'var(--color-text)',
        textMuted: 'var(--color-text-muted)',
        primary: 'var(--color-primary)',
        primaryHover: 'var(--color-primary-hover)',
        accent: 'var(--color-accent)',
        border: 'var(--color-border)',
      },
      fontFamily: {
        display: 'var(--font-display)',
        body: 'var(--font-body)',
      },
      borderRadius: {
        card: 'var(--radius-card)',
        control: 'var(--radius-control)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
      },
    },
  },
  plugins: [],
}
