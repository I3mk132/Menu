/**
 * Central theme configuration.
 *
 * Add a new theme by adding an entry here — nothing else in the app
 * needs to change. ThemeContext writes each theme's `vars` onto
 * document.documentElement as CSS custom properties, and every
 * component reads colors/fonts/radii through Tailwind classes like
 * `bg-primary`, `font-display`, `rounded-card` (see tailwind.config.js).
 */
export const THEMES = {
  'warm-cafe': {
    label: 'Warm Cafe',
    mode: 'light',
    vars: {
      '--color-bg': '#F3E9DC',
      '--color-surface': '#FFFBF5',
      '--color-surface-alt': '#EADFCE',
      '--color-text': '#2F2318',
      '--color-text-muted': '#7A6A56',
      '--color-primary': '#6F4E37',
      '--color-primary-hover': '#5A3E2B',
      '--color-accent': '#C08552',
      '--color-border': '#E1D3BC',
      '--font-display': "'Fraunces', serif",
      '--font-body': "'Karla', sans-serif",
      '--radius-card': '1.5rem',
      '--radius-control': '0.9rem',
      '--shadow-card': '0 10px 30px -12px rgba(47, 35, 24, 0.25)',
    },
  },
  'fast-food': {
    label: 'Modern Fast Food',
    mode: 'light',
    vars: {
      '--color-bg': '#FFFCF5',
      '--color-surface': '#FFFFFF',
      '--color-surface-alt': '#FFF1C6',
      '--color-text': '#1A1310',
      '--color-text-muted': '#6B5F55',
      '--color-primary': '#D62828',
      '--color-primary-hover': '#B71F1F',
      '--color-accent': '#FCBF49',
      '--color-border': '#F1E4B8',
      '--font-display': "'Poppins', sans-serif",
      '--font-body': "'Work Sans', sans-serif",
      '--radius-card': '0.25rem',
      '--radius-control': '0.125rem',
      '--shadow-card': '6px 6px 0px 0px rgba(26, 19, 16, 0.9)',
    },
  },
  'luxury-dining': {
    label: 'Luxury Dining',
    mode: 'dark',
    vars: {
      '--color-bg': '#100E0C',
      '--color-surface': '#1B1815',
      '--color-surface-alt': '#252019',
      '--color-text': '#EDE6DA',
      '--color-text-muted': '#A79C8B',
      '--color-primary': '#C9A24B',
      '--color-primary-hover': '#B8912F',
      '--color-accent': '#B08D57',
      '--color-border': '#332C22',
      '--font-display': "'Cormorant Garamond', serif",
      '--font-body': "'Jost', sans-serif",
      '--radius-card': '0.5rem',
      '--radius-control': '0.25rem',
      '--shadow-card': '0 20px 40px -20px rgba(0, 0, 0, 0.6)',
    },
  },
}

export const DEFAULT_THEME = 'warm-cafe'
