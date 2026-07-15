import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowLeft, LayoutGrid, UtensilsCrossed } from 'lucide-react'
import LanguageSwitcher from '../common/LanguageSwitcher'
import ThemeSelector from '../common/ThemeSelector'

export default function AdminLayout({ activeTab, onTabChange, children }) {
  const { t } = useTranslation()

  const tabs = [
    { id: 'categories', label: t('admin.categoriesTab') },
    { id: 'items', label: t('admin.itemsTab') },
  ]

  return (
    <div className="min-h-screen bg-bg font-body">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2 font-display text-lg font-semibold text-text">
            <LayoutGrid size={20} className="text-primary" />
            {t('admin.dashboard')}
          </div>
          <div className="flex items-center gap-3">
            <ThemeSelector />
            <LanguageSwitcher />
            <Link
              to="/"
              className="flex items-center gap-1.5 rounded-control border border-border px-3 py-2 text-sm text-text hover:border-primary"
            >
              <ArrowLeft size={14} />
              <UtensilsCrossed size={14} />
              <span className="hidden sm:inline">{t('admin.backToMenu')}</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex gap-2 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'text-primary' : 'text-textMuted hover:text-text'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        {children}
      </div>
    </div>
  )
}
