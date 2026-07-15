import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus } from 'lucide-react'
import { localized, formatPrice } from '../../utils/localize'
import { useCart } from '../../context/CartContext'

export default function ItemModal({ item, onClose }) {
  const { t, i18n } = useTranslation()
  const { addItem, lineUnitPrice } = useCart()
  const [size, setSize] = useState(item?.sizes?.[0] ?? null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    setSize(item?.sizes?.[0] ?? null)
    setQuantity(1)
  }, [item])

  if (!item) return null

  const name = localized(item, 'name', i18n.language)
  const description = localized(item, 'description', i18n.language)
  const unitPrice = lineUnitPrice(item, size)

  const handleAdd = () => {
    addItem(item, size, quantity)
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50"
      />
      <motion.div
        key="modal"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 300 }}
        role="dialog"
        aria-modal="true"
        aria-label={name}
        className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-card border border-border bg-surface sm:bottom-8 sm:rounded-card"
      >
        <div className="relative aspect-[16/10] w-full bg-surfaceAlt">
          {item.image_url && (
            <img src={item.image_url} alt={name} className="h-full w-full object-cover sm:rounded-t-card" />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="absolute end-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-5">
          <div>
            <h2 className="font-display text-2xl font-semibold text-text">{name}</h2>
            {description && <p className="mt-1 text-sm text-textMuted">{description}</p>}
          </div>

          {item.sizes?.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-text">{t('item.selectSize')}</p>
              <div className="flex flex-wrap gap-2">
                {item.sizes.map((s) => {
                  const active = size?.name_en === s.name_en
                  return (
                    <button
                      key={s.name_en}
                      type="button"
                      onClick={() => setSize(s)}
                      className={`rounded-control border px-3 py-2 text-sm transition-colors ${
                        active
                          ? 'border-primary bg-primary text-white'
                          : 'border-border bg-surface text-text hover:border-primary'
                      }`}
                    >
                      {localized(s, 'name', i18n.language)}
                      {s.price_modifier > 0 && ` (+${formatPrice(s.price_modifier)})`}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text">{t('item.quantity')}</p>
            <div className="flex items-center gap-3 rounded-control border border-border px-2 py-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="flex h-7 w-7 items-center justify-center rounded-control text-text hover:bg-surfaceAlt"
              >
                <Minus size={14} />
              </button>
              <span className="w-5 text-center text-sm font-semibold text-text">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
                className="flex h-7 w-7 items-center justify-center rounded-control text-text hover:bg-surfaceAlt"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={!item.is_available}
            className="mt-2 flex w-full items-center justify-between rounded-control bg-primary px-5 py-3.5 text-white transition-colors hover:bg-primaryHover disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="font-medium">{t('item.addToOrder')}</span>
            <span className="font-display font-semibold">{formatPrice(unitPrice * quantity)}</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
