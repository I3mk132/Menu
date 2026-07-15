import axios from 'axios'

// In Docker, this is injected at build time via the VITE_API_URL build arg
// (see docker-compose.yml). For local `npm run dev`, it falls back to the
// FastAPI dev server on :8000.
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Only relevant for local/demo use, where the browser is on "localhost"
// instead of a real per-tenant domain — the backend can't tell tenants
// apart by Host header alone in that case, so we tell it explicitly.
// Unset in real deployments; each tenant's own domain resolves them.
const tenantSlug = import.meta.env.VITE_TENANT_SLUG

export const api = axios.create({
  baseURL,
  timeout: 8000,
  headers: tenantSlug ? { 'X-Tenant-Slug': tenantSlug } : {},
})

// ---------------------------------------------------------------- Tenant
export const getTenantConfig = () => api.get('/api/v1/tenant/config').then((r) => r.data)

// ---------------------------------------------------------------- Public
export const getCategories = () => api.get('/api/v1/categories').then((r) => r.data)

export const getMenuItems = (categoryId) =>
  api
    .get('/api/v1/menu-items', { params: categoryId ? { category_id: categoryId } : {} })
    .then((r) => r.data)

// ---------------------------------------------------------------- Admin
export const adminGetCategories = () => api.get('/api/v1/admin/categories').then((r) => r.data)
export const adminCreateCategory = (data) => api.post('/api/v1/admin/categories', data).then((r) => r.data)
export const adminUpdateCategory = (id, data) => api.put(`/api/v1/admin/categories/${id}`, data).then((r) => r.data)
export const adminDeleteCategory = (id) => api.delete(`/api/v1/admin/categories/${id}`)

export const adminGetMenuItems = () => api.get('/api/v1/admin/menu-items').then((r) => r.data)
export const adminCreateMenuItem = (data) => api.post('/api/v1/admin/menu-items', data).then((r) => r.data)
export const adminUpdateMenuItem = (id, data) => api.put(`/api/v1/admin/menu-items/${id}`, data).then((r) => r.data)
export const adminDeleteMenuItem = (id) => api.delete(`/api/v1/admin/menu-items/${id}`)

// Uploads an image to this tenant's Cloudflare R2 prefix. `folder` groups
// assets in the bucket (e.g. "menu-items"). Returns { path, url }.
export const adminUploadImage = (file, folder = 'menu-items') => {
  const formData = new FormData()
  formData.append('file', file)
  return api
    .post('/api/v1/admin/uploads', formData, {
      params: { folder },
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data)
}
