import { createContext, useContext, useState, useCallback } from 'react'
import { getTenantConfig } from '../services/api'

const TenantContext = createContext(null)

/**
 * `initialTenant` is pre-fetched by loadBranding() before the app ever
 * renders (see main.jsx / src/branding/loadBranding.js), so there's no
 * loading flash on first paint. `refetch` is exposed in case branding
 * is edited in the platform admin panel and needs to be pulled again
 * without a full page reload.
 */
export function TenantProvider({ initialTenant, children }) {
  const [tenant, setTenant] = useState(initialTenant)

  const refetch = useCallback(async () => {
    try {
      const data = await getTenantConfig()
      setTenant(data)
      return data
    } catch (err) {
      console.error('Failed to refresh tenant config', err)
      return null
    }
  }, [])

  return <TenantContext.Provider value={{ tenant, refetch }}>{children}</TenantContext.Provider>
}

export function useTenant() {
  const ctx = useContext(TenantContext)
  if (!ctx) throw new Error('useTenant must be used within a TenantProvider')
  return ctx
}
