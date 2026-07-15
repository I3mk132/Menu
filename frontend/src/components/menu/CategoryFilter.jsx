import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { localized } from '../../utils/localize'

export default function CategoryFilter({ categories, activeCategory, onSelect }) {
  const { t, i18n } = useTranslation()

  const tabs = [{ id: null, label: t('category.all') }, ...categories.map((c) => ({
    id: c.id,
    label: localized(c, 'name', i18n.language),
  }))]

  return (
    <div className="sticky top-[60px] z-10 border-b border-border bg-bg/95 backdrop-blur">
      <div className="no-scrollbar mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3 sm:px-6">
        {tabs.map((tab) => {
          const isActive = activeCategory === tab.id
          return (
            <button
              key={tab.id ?? 'all'}
              type="button"
              onClick={() => onSelect(tab.id)}
              className={`relative shrink-0 rounded-control px-4 py-2 text-sm font-medium transition-colors ${
                isActive ? 'text-white' : 'text-textMuted hover:text-text'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="category-pill"
                  className="absolute inset-0 rounded-control bg-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
