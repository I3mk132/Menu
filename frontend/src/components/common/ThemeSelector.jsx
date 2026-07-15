import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Palette, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeSelector() {
  const { t } = useTranslation()
  const { themeId, setThemeId, themes } = useTheme()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('theme.label')}
        className="flex items-center gap-1.5 rounded-control border border-border bg-surface px-3 py-2 text-sm text-text transition-colors hover:border-primary"
      >
        <Palette size={16} strokeWidth={2} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            className="absolute end-0 z-30 mt-2 w-52 overflow-hidden rounded-control border border-border bg-surface shadow-card"
          >
            {Object.entries(themes).map(([id, theme]) => (
              <li key={id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={themeId === id}
                  onClick={() => {
                    setThemeId(id)
                    setOpen(false)
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-sm text-text hover:bg-surfaceAlt"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-border"
                      style={{ backgroundColor: theme.vars['--color-primary'] }}
                    />
                    {theme.label}
                  </span>
                  {themeId === id && <Check size={14} className="text-primary" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
