import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, Loader2, X, Image as ImageIcon } from 'lucide-react'
import { adminUploadImage } from '../../services/api'

/**
 * Controlled field for an item's image. Supports two paths:
 *   1. Upload a file — sent straight to the backend, which stores it in
 *      this tenant's Cloudflare R2 prefix and returns a public URL.
 *   2. Paste a URL directly, for restaurants that already have hosted
 *      photography elsewhere.
 *
 * Reports back { image_url, image_path } — image_path is only set when
 * the image came from an upload (so the backend can clean up the old
 * R2 object if it's later replaced or removed).
 */
export default function ImageUploadField({ imageUrl, onChange, folder = 'menu-items' }) {
  const { t } = useTranslation()
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return

    setUploading(true)
    setError(null)
    try {
      const result = await adminUploadImage(file, folder)
      onChange({ image_url: result.url, image_path: result.path })
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.detail || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-textMuted">{t('admin.fields.imageUrl')}</span>

      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-control border border-border bg-surfaceAlt">
          {imageUrl ? (
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon size={20} className="text-textMuted" />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => onChange({ image_url: e.target.value, image_path: null })}
            placeholder="https://..."
            className="rounded-control border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 rounded-control border border-border px-3 py-1.5 text-xs font-medium text-text hover:border-primary disabled:opacity-50"
            >
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
              {uploading ? 'Uploading...' : 'Upload image'}
            </button>
            {imageUrl && (
              <button
                type="button"
                onClick={() => onChange({ image_url: '', image_path: null })}
                className="flex items-center gap-1 text-xs text-textMuted hover:text-primary"
              >
                <X size={12} />
                {t('common.delete')}
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            onChange={handleFileSelect}
            className="hidden"
          />

          {error && <p className="text-xs text-primary">{error}</p>}
        </div>
      </div>
    </div>
  )
}
