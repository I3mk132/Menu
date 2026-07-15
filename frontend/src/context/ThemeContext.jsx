import { createContext, useContext, useEffect, useState } from 'react'
import { THEMES, DEFAULT_THEME } from '../styles/themes'
import { useTenant } from './TenantContext'

const ThemeContext = createContext(null)

const STORAGE_KEY = 'menu-theme'

export function ThemeProvider({ children }) {
  const { tenant } = useTenant()
  const [themeId, setThemeId] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored && THEMES[stored] ? stored : DEFAULT_THEME
  })

  useEffect(() => {
    const theme = THEMES[themeId] || THEMES[DEFAULT_THEME]
    const root = document.documentElement

    // 1. Apply the chosen style preset — this sets fonts, radius,
    //    shadow, and a default color palette.
    Object.entries(theme.vars).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    // 2. Layer the tenant's own brand colors on top, if branding has
    //    loaded. This is what makes white-labeling and style presets
    //    coexist: the preset decides the *shape* of the UI (serif vs.
    //    bold sans, rounded vs. sharp), the tenant decides the *color*.
    if (tenant?.primary_color) root.style.setProperty('--color-primary', tenant.primary_color)
    if (tenant?.secondary_color) root.style.setProperty('--color-accent', tenant.secondary_color)

    root.classList.toggle('dark', theme.mode === 'dark')
    root.setAttribute('data-theme', themeId)
    localStorage.setItem(STORAGE_KEY, themeId)
  }, [themeId, tenant])

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}
