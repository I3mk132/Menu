import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import LanguageTabs from './LanguageTabs'

const emptyCategory = { name_en: '', name_ar: '', name_tr: '', sort_order: 0 }

export default function CategoryEditor({ category, onClose, onSave }) {
  const { t } = useTranslation()
  const [form, setForm] = useState(category ? { ...category } : { ...emptyCategory })
  const [lang, setLang] = useState('en')
  const isEdit = Boolean(category)

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        role="dialog"
        aria-modal="true"
        className="fixed inset-x-4 top-10 z-50 mx-auto max-w-md rounded-card border border-border bg-surface p-5 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-text">
            {isEdit ? t('admin.editCategory') : t('admin.addCategory')}
          </h2>
          <button type="button" onClick={onClose} className="text-textMuted hover:text-text">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <LanguageTabs active={lang} onChange={setLang} />

          {lang === 'en' && (
            <Field label={t('admin.fields.nameEn')} value={form.name_en} onChange={(v) => update('name_en', v)} />
          )}
          {lang === 'ar' && (
            <Field
              label={t('admin.fields.nameAr')}
              value={form.name_ar}
              onChange={(v) => update('name_ar', v)}
              dir="rtl"
            />
          )}
          {lang === 'tr' && (
            <Field label={t('admin.fields.nameTr')} value={form.name_tr} onChange={(v) => update('name_tr', v)} />
          )}

          <Field
            label={t('admin.fields.sortOrder')}
            type="number"
            value={form.sort_order}
            onChange={(v) => update('sort_order', Number(v))}
          />

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-control border border-border px-4 py-2 text-sm text-text hover:border-primary"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="rounded-control bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primaryHover"
            >
              {t('common.save')}
            </button>
          </div>
        </form>
      </motion.div>
    </AnimatePresence>
  )
}

function Field({ label, value, onChange, type = 'text', dir }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-textMuted">{label}</span>
      <input
        type={type}
        value={value}
        dir={dir}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-control border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary"
      />
    </label>
  )
}
