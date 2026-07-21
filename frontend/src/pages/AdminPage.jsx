import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Trash2, Plus, RefreshCw } from 'lucide-react'

import AdminLayout from '../components/admin/AdminLayout'
import LoginPage from '../components/admin/LoginPage'
import CategoryEditor from '../components/admin/CategoryEditor'
import ItemEditor from '../components/admin/ItemEditor'
import SettingsEditor from '../components/admin/SettingsEditor'
import ConfirmDialog from '../components/admin/ConfirmDialog'
import { localized, formatPrice } from '../utils/localize'
import { useTenant } from '../context/TenantContext'
import {
  getAdminToken,
  clearAdminToken,
  adminGetCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminGetMenuItems,
  adminCreateMenuItem,
  adminUpdateMenuItem,
  adminDeleteMenuItem,
} from '../services/api'

export default function AdminPage() {
  const { t, i18n } = useTranslation()
  const { tenant } = useTenant()
  const [authed, setAuthed] = useState(() => Boolean(getAdminToken()))
  const [activeTab, setActiveTab] = useState('categories')
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading')

  const [editingCategory, setEditingCategory] = useState(undefined) // undefined = closed, null = new, obj = edit
  const [editingItem, setEditingItem] = useState(undefined)
  const [deleteTarget, setDeleteTarget] = useState(null) // { type: 'category'|'item', id }

  const load = async () => {
    setStatus('loading')
    try {
      const [cats, menuItems] = await Promise.all([adminGetCategories(), adminGetMenuItems()])
      setCategories(cats)
      setItems(menuItems)
      setStatus('ready')
    } catch (err) {
      console.error(err)
      // A 401 here means the token was missing/expired/wrong-tenant —
      // the api.js interceptor already cleared it, so drop back to
      // the login screen instead of showing a dead error state.
      if (err.response?.status === 401) {
        setAuthed(false)
      } else {
        setStatus('error')
      }
    }
  }

  useEffect(() => {
    if (authed) load()
  }, [authed])

  const handleLogout = () => {
    clearAdminToken()
    setAuthed(false)
  }

  if (!authed) {
    return <LoginPage tenantName={tenant?.name} onSuccess={() => setAuthed(true)} />
  }

  const saveCategory = async (data) => {
    if (data.id) {
      await adminUpdateCategory(data.id, data)
    } else {
      await adminCreateCategory(data)
    }
    setEditingCategory(undefined)
    load()
  }

  const saveItem = async (data) => {
    if (data.id) {
      await adminUpdateMenuItem(data.id, data)
    } else {
      await adminCreateMenuItem(data)
    }
    setEditingItem(undefined)
    load()
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    if (deleteTarget.type === 'category') {
      await adminDeleteCategory(deleteTarget.id)
    } else {
      await adminDeleteMenuItem(deleteTarget.id)
    }
    setDeleteTarget(null)
    load()
  }

  const categoryName = (id) => categories.find((c) => c.id === id)?.name_en || '—'

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout}>
      {status === 'loading' && activeTab !== 'settings' && (
        <div className="flex items-center justify-center gap-2 py-16 text-textMuted">
          <RefreshCw className="animate-spin" size={18} />
          <span className="text-sm">{t('common.loading')}</span>
        </div>
      )}

      {activeTab === 'settings' && <SettingsEditor />}

      {status === 'ready' && activeTab === 'categories' && (
        <div>
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => setEditingCategory(null)}
              className="flex items-center gap-1.5 rounded-control bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primaryHover"
            >
              <Plus size={16} />
              {t('admin.addCategory')}
            </button>
          </div>

          {categories.length === 0 ? (
            <EmptyState message={t('admin.noCategories')} />
          ) : (
            <div className="overflow-hidden rounded-card border border-border bg-surface">
              {categories
                .slice()
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between border-b border-border px-4 py-3 last:border-b-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-text">
                        {localized(cat, 'name', i18n.language)}
                      </p>
                      <p className="text-xs text-textMuted">{t('admin.fields.sortOrder')}: {cat.sort_order}</p>
                    </div>
                    <div className="flex gap-1">
                      <IconButton onClick={() => setEditingCategory(cat)} icon={Pencil} label={t('common.edit')} />
                      <IconButton
                        onClick={() => setDeleteTarget({ type: 'category', id: cat.id })}
                        icon={Trash2}
                        label={t('common.delete')}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {status === 'ready' && activeTab === 'items' && (
        <div>
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => setEditingItem(null)}
              disabled={categories.length === 0}
              className="flex items-center gap-1.5 rounded-control bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primaryHover disabled:opacity-50"
            >
              <Plus size={16} />
              {t('admin.addItem')}
            </button>
          </div>

          {items.length === 0 ? (
            <EmptyState message={t('admin.noItems')} />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 rounded-card border border-border bg-surface p-3">
                  {item.image_url && (
                    <img src={item.image_url} alt="" className="h-16 w-16 shrink-0 rounded-control object-cover" />
                  )}
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-text">{localized(item, 'name', i18n.language)}</p>
                      {!item.is_available && (
                        <span className="shrink-0 rounded-control bg-surfaceAlt px-1.5 py-0.5 text-[10px] font-medium text-textMuted">
                          {t('item.unavailable')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-textMuted">{categoryName(item.category_id)}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-sm font-semibold text-primary">
                        {formatPrice(item.discounted_price ?? item.price)}
                      </span>
                      <div className="flex gap-1">
                        <IconButton onClick={() => setEditingItem(item)} icon={Pencil} label={t('common.edit')} />
                        <IconButton
                          onClick={() => setDeleteTarget({ type: 'item', id: item.id })}
                          icon={Trash2}
                          label={t('common.delete')}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {editingCategory !== undefined && (
        <CategoryEditor
          category={editingCategory}
          onClose={() => setEditingCategory(undefined)}
          onSave={saveCategory}
        />
      )}

      {editingItem !== undefined && (
        <ItemEditor
          item={editingItem}
          categories={categories}
          onClose={() => setEditingItem(undefined)}
          onSave={saveItem}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        message={
          deleteTarget?.type === 'category'
            ? t('admin.confirmDeleteCategory')
            : t('admin.confirmDeleteItem')
        }
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  )
}

function IconButton({ onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-control text-textMuted hover:bg-surfaceAlt hover:text-primary"
    >
      <Icon size={15} />
    </button>
  )
}

function EmptyState({ message }) {
  return (
    <div className="rounded-card border border-dashed border-border py-14 text-center text-sm text-textMuted">
      {message}
    </div>
  )
}
