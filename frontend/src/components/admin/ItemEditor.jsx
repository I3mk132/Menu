import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2 } from 'lucide-react'
import LanguageTabs from './LanguageTabs'
import ImageUploadField from './ImageUploadField'

const emptySize = { name_en: '', name_ar: '', name_tr: '', price_modifier: 0 }

const emptyItem = {
  category_id: '',
  name_en: '',
  name_ar: '',
  name_tr: '',
  description_en: '',
  description_ar: '',
  description_tr: '',
  price: '',
  discounted_price: '',
  image_url: '',
  image_path: null,
  is_available: true,
  sizes: [],
}

export default function ItemEditor({ item, categories, onClose, onSave }) {
  const { t } = useTranslation()
  const [form, setForm] = useState(
    item
      ? { ...item, discounted_price: item.discounted_price ?? '', sizes: item.sizes || [], image_path: item.image_path ?? null }
      : { ...emptyItem, category_id: categories[0]?.id ?? '' }
  )
  const [lang, setLang] = useState('en')
  const isEdit = Boolean(item)

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const updateSize = (index, field, value) =>
    setForm((f) => ({
      ...f,
      sizes: f.sizes.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    }))

  const addSize = () => setForm((f) => ({ ...f, sizes: [...f.sizes, { ...emptySize }] }))
  const removeSize = (index) =>
    setForm((f) => ({ ...f, sizes: f.sizes.filter((_, i) => i !== index) }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...form,
      category_id: Number(form.category_id),
      price: Number(form.price),
      discounted_price: form.discounted_price === '' ? null : Number(form.discounted_price),
      sizes: form.sizes.map((s) => ({ ...s, price_modifier: Number(s.price_modifier) || 0 })),
    })
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
        className="fixed inset-x-4 top-6 z-50 mx-auto max-h-[88vh] max-w-lg overflow-y-auto rounded-card border border-border bg-surface p-5 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-text">
            {isEdit ? t('admin.editItem') : t('admin.addItem')}
          </h2>
          <button type="button" onClick={onClose} className="text-textMuted hover:text-text">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label={t('admin.fields.category')} as="select" value={form.category_id} onChange={(v) => update('category_id', v)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_en}
              </option>
            ))}
          </Field>

          <LanguageTabs active={lang} onChange={setLang} />

          {lang === 'en' && (
            <>
              <Field label={t('admin.fields.nameEn')} value={form.name_en} onChange={(v) => update('name_en', v)} />
              <Field
                label={t('admin.fields.descriptionEn')}
                as="textarea"
                value={form.description_en}
                onChange={(v) => update('description_en', v)}
              />
            </>
          )}
          {lang === 'ar' && (
            <>
              <Field label={t('admin.fields.nameAr')} value={form.name_ar} onChange={(v) => update('name_ar', v)} dir="rtl" />
              <Field
                label={t('admin.fields.descriptionAr')}
                as="textarea"
                value={form.description_ar}
                onChange={(v) => update('description_ar', v)}
                dir="rtl"
              />
            </>
          )}
          {lang === 'tr' && (
            <>
              <Field label={t('admin.fields.nameTr')} value={form.name_tr} onChange={(v) => update('name_tr', v)} />
              <Field
                label={t('admin.fields.descriptionTr')}
                as="textarea"
                value={form.description_tr}
                onChange={(v) => update('description_tr', v)}
              />
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label={t('admin.fields.price')} type="number" step="0.01" value={form.price} onChange={(v) => update('price', v)} />
            <Field
              label={t('admin.fields.discountedPrice')}
              type="number"
              step="0.01"
              value={form.discounted_price}
              onChange={(v) => update('discounted_price', v)}
            />
          </div>

          <ImageUploadField
            imageUrl={form.image_url}
            onChange={({ image_url, image_path }) => setForm((f) => ({ ...f, image_url, image_path }))}
          />

          <label className="flex items-center justify-between rounded-control border border-border px-3 py-2.5">
            <span className="text-sm text-text">{t('admin.fields.available')}</span>
            <input
              type="checkbox"
              checked={form.is_available}
              onChange={(e) => update('is_available', e.target.checked)}
              className="h-4 w-4 accent-current text-primary"
            />
          </label>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-textMuted">{t('admin.fields.sizes')}</span>
              <button
                type="button"
                onClick={addSize}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <Plus size={12} />
                {t('admin.fields.addSize')}
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {form.sizes.map((size, index) => (
                <div key={index} className="grid grid-cols-[1fr_1fr_1fr_auto_auto] items-center gap-1.5 rounded-control border border-border p-2">
                  <input
                    placeholder={t('admin.fields.sizeNameEn')}
                    value={size.name_en}
                    onChange={(e) => updateSize(index, 'name_en', e.target.value)}
                    className="min-w-0 rounded-control border border-border bg-surface px-2 py-1.5 text-xs text-text outline-none focus:border-primary"
                  />
                  <input
                    placeholder={t('admin.fields.sizeNameAr')}
                    dir="rtl"
                    value={size.name_ar}
                    onChange={(e) => updateSize(index, 'name_ar', e.target.value)}
                    className="min-w-0 rounded-control border border-border bg-surface px-2 py-1.5 text-xs text-text outline-none focus:border-primary"
                  />
                  <input
                    placeholder={t('admin.fields.sizeNameTr')}
                    value={size.name_tr}
                    onChange={(e) => updateSize(index, 'name_tr', e.target.value)}
                    className="min-w-0 rounded-control border border-border bg-surface px-2 py-1.5 text-xs text-text outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="+0.00"
                    value={size.price_modifier}
                    onChange={(e) => updateSize(index, 'price_modifier', e.target.value)}
                    className="w-16 min-w-0 rounded-control border border-border bg-surface px-2 py-1.5 text-xs text-text outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => removeSize(index)}
                    aria-label="Remove size"
                    className="flex h-7 w-7 items-center justify-center rounded-control text-textMuted hover:bg-surfaceAlt hover:text-primary"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

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

function Field({ label, value, onChange, type = 'text', dir, as = 'input', children, ...rest }) {
  const Component = as
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-textMuted">{label}</span>
      {as === 'select' ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-control border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary"
        >
          {children}
        </select>
      ) : (
        <Component
          type={as === 'input' ? type : undefined}
          value={value}
          dir={dir}
          onChange={(e) => onChange(e.target.value)}
          rows={as === 'textarea' ? 2 : undefined}
          {...rest}
          className="rounded-control border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary"
        />
      )}
    </label>
  )
}
