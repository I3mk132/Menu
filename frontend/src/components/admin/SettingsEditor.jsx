import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshCw } from 'lucide-react'

import { adminGetSettings, adminUpdateSettings } from '../../services/api'

const ORDER_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' },
  { value: 'tr', label: 'Türkçe' },
]

// Tenant-admin ordering settings: the WhatsApp number orders are sent to, and
// the fixed language those order messages are written in (independent of the
// customer's current UI language).
export default function SettingsEditor() {
  const { t } = useTranslation()
  const [form, setForm] = useState({ whatsapp_number: '', order_language: 'en' })
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved | error

  useEffect(() => {
    let alive = true
    adminGetSettings()
      .then((data) => {
        if (!alive) return
        setForm({
          whatsapp_number: data.whatsapp_number ?? '',
          order_language: data.order_language ?? 'en',
        })
        setStatus('ready')
      })
      .catch((err) => {
        console.error(err)
        if (alive) setStatus('error')
      })
    return () => {
      alive = false
    }
  }, [])

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }))
    setSaveState('idle')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaveState('saving')
    try {
      const saved = await adminUpdateSettings(form)
      setForm({
        whatsapp_number: saved.whatsapp_number ?? '',
        order_language: saved.order_language ?? 'en',
      })
      setSaveState('saved')
    } catch (err) {
      console.error(err)
      setSaveState('error')
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-textMuted">
        <RefreshCw className="animate-spin" size={18} />
        <span className="text-sm">{t('common.loading')}</span>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="rounded-card border border-dashed border-border py-14 text-center text-sm text-textMuted">
        {t('common.error')}
      </div>
    )
  }

  return (
    <div className="max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-card border border-border bg-surface p-5">
        <div>
          <h2 className="font-display text-lg font-semibold text-text">{t('admin.settings.title')}</h2>
          <p className="mt-1 text-xs text-textMuted">{t('admin.settings.description')}</p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-textMuted">{t('admin.settings.whatsappNumber')}</span>
          <input
            type="tel"
            inputMode="numeric"
            dir="ltr"
            value={form.whatsapp_number}
            onChange={(e) => update('whatsapp_number', e.target.value)}
            placeholder="905551234567"
            className="rounded-control border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
          <span className="text-xs text-textMuted">{t('admin.settings.whatsappHint')}</span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-textMuted">{t('admin.settings.orderLanguage')}</span>
          <select
            value={form.order_language}
            onChange={(e) => update('order_language', e.target.value)}
            className="rounded-control border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary"
          >
            {ORDER_LANGUAGES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-textMuted">{t('admin.settings.orderLanguageHint')}</span>
        </label>

        <div className="flex items-center justify-end gap-3">
          {saveState === 'saved' && <span className="text-xs text-primary">{t('admin.settings.saved')}</span>}
          {saveState === 'error' && <span className="text-xs text-red-500">{t('common.error')}</span>}
          <button
            type="submit"
            disabled={saveState === 'saving'}
            className="rounded-control bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primaryHover disabled:opacity-50"
          >
            {t('common.save')}
          </button>
        </div>
      </form>
    </div>
  )
}
