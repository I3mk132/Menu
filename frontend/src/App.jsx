import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { ThemeProvider } from './context/ThemeContext'
import { CartProvider } from './context/CartContext'
import { RTL_LANGUAGES } from './i18n'

import MenuPage from './pages/MenuPage'
import AdminPage from './pages/AdminPage'

function DirectionManager() {
  const { i18n } = useTranslation()

  useEffect(() => {
    const dir = RTL_LANGUAGES.includes(i18n.language) ? 'rtl' : 'ltr'
    document.documentElement.setAttribute('dir', dir)
    document.documentElement.setAttribute('lang', i18n.language)
  }, [i18n.language])

  return null
}

export default function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <DirectionManager />
        <Routes>
          <Route path="/" element={<MenuPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </CartProvider>
    </ThemeProvider>
  )
}
