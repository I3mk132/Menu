import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminLogin } from '../../services/api'

/**
 * Intentionally plain — a centered form, no illustration or branding
 * beyond the tenant name. It's a gate in front of /admin, not a
 * marketing surface, so it borrows the app's existing color tokens
 * and nothing else.
 */
export default function LoginPage({ tenantName, onSuccess }) {
  const { t } = useTranslation()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password || loading) return
    setError('')
    setLoading(true)
    try {
      await adminLogin(password)
      onSuccess()
    } catch (err) {
      setError(t('admin.login.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 font-body">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-card border border-border bg-surface p-6"
      >
        <h1 className="mb-1 font-display text-lg font-semibold text-text">
          {t('admin.login.title')}
        </h1>
        {tenantName && <p className="mb-5 text-sm text-textMuted">{tenantName}</p>}

        <label className="mb-1 block text-sm font-medium text-text" htmlFor="admin-password">
          {t('admin.login.passwordLabel')}
        </label>
        <input
          id="admin-password"
          type="password"
          autoFocus
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-control border border-border bg-bg px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
        />

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-control bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primaryHover disabled:opacity-50"
        >
          {t('admin.login.submit')}
        </button>
      </form>
    </div>
  )
}
