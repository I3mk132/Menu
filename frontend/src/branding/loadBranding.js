import { getTenantConfig } from '../services/api'

/**
 * Runs once, before the app renders (see main.jsx). It:
 *   1. Calls GET /api/v1/tenant/config, which the backend resolves from
 *      the current domain (or X-Tenant-Slug in local dev).
 *   2. Applies everything that needs to be right on the very first
 *      paint — tab title, meta description, favicon — directly to the
 *      DOM, so there's no flash of default/wrong branding before React
 *      hydrates.
 *   3. Returns the tenant object so it can be threaded into
 *      <TenantProvider> as the initial value (no second fetch).
 *
 * Brand *colors* are deliberately NOT applied here — that's
 * ThemeContext's job, since it needs to layer the tenant's colors on
 * top of whichever style preset (Warm Cafe / Fast Food / Luxury) is
 * active, and doing that in one place avoids the two fighting over
 * who wrote --color-primary last.
 *
 * Fails soft: if the tenant can't be resolved (unmapped domain,
 * backend unreachable), the app still renders with the static
 * defaults already in index.html / i18n strings.
 */
export async function loadTenantBranding() {
  try {
    const tenant = await getTenantConfig()
    applyDocumentBranding(tenant)
    return tenant
  } catch (err) {
    console.warn('Could not load tenant branding — using template defaults.', err)
    return null
  }
}

function applyDocumentBranding(tenant) {
  if (!tenant) return

  if (tenant.name) {
    document.title = tenant.name
  }

  if (tenant.description) {
    setMetaTag('description', tenant.description)
  }

  if (tenant.favicon_url) {
    setFavicon(tenant.favicon_url)
  }
}

function setMetaTag(name, content) {
  let tag = document.querySelector(`meta[name="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('name', name)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function setFavicon(url) {
  let link = document.querySelector('link[rel="icon"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.href = url
}
