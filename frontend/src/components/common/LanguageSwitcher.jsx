import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'tr', label: 'Türkçe' },
]

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
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
        aria-label={t('language.label')}
        className="flex items-center gap-1.5 rounded-control border border-border bg-surface px-3 py-2 text-sm text-text transition-colors hover:border-primary"
      >
        <Globe size={16} strokeWidth={2} />
        <span className="uppercase">{i18n.language}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            className="absolute end-0 z-30 mt-2 w-40 overflow-hidden rounded-control border border-border bg-surface shadow-card"
          >
            {LANGUAGES.map((lang) => (
              <li key={lang.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={i18n.language === lang.code}
                  onClick={() => {
                    i18n.changeLanguage(lang.code)
                    setOpen(false)
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-sm text-text hover:bg-surfaceAlt"
                >
                  {lang.label}
                  {i18n.language === lang.code && <Check size={14} className="text-primary" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
