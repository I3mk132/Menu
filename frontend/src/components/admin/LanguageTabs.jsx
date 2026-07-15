import { useTranslation } from 'react-i18next'

const LANGS = [
  { code: 'en', key: 'english' },
  { code: 'ar', key: 'arabic' },
  { code: 'tr', key: 'turkish' },
]

export default function LanguageTabs({ active, onChange }) {
  const { t } = useTranslation()

  return (
    <div className="mb-3 flex gap-1 rounded-control bg-surfaceAlt p-1">
      {LANGS.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => onChange(lang.code)}
          className={`flex-1 rounded-control px-3 py-1.5 text-xs font-medium transition-colors ${
            active === lang.code ? 'bg-surface text-primary shadow-sm' : 'text-textMuted hover:text-text'
          }`}
        >
          {t(`admin.tabs.${lang.key}`)}
        </button>
      ))}
    </div>
  )
}
