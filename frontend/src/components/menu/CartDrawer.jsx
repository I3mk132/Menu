import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, Trash2, ShoppingBag, MessageCircle } from 'lucide-react'
import { localized, formatPrice } from '../../utils/localize'
import { buildWhatsappOrderUrl } from '../../utils/whatsappOrder'
import { useCart } from '../../context/CartContext'
import { useTenant } from '../../context/TenantContext'

export default function CartDrawer() {
  const { t, i18n } = useTranslation()
  const { tenant } = useTenant()
  const { lines, isOpen, setIsOpen, updateQuantity, removeLine, subtotal, clearCart, lineUnitPrice } =
    useCart()

  const whatsappUrl = buildWhatsappOrderUrl(tenant, lines, subtotal, lineUnitPrice)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/50"
          />
          <motion.div
            key="cart-drawer"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-label={t('cart.title')}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-card border border-border bg-surface sm:bottom-8 sm:rounded-card"
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 className="font-display text-lg font-semibold text-text">{t('cart.title')}</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label={t('common.close')}
                className="flex h-8 w-8 items-center justify-center rounded-full text-text hover:bg-surfaceAlt"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {lines.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <ShoppingBag size={32} className="text-textMuted" />
                  <p className="max-w-xs text-sm text-textMuted">{t('cart.empty')}</p>
                </div>
              ) : (
                <ul className="flex flex-col gap-4">
                  {lines.map((line) => {
                    const name = localized(line.item, 'name', i18n.language)
                    const sizeName = line.size ? localized(line.size, 'name', i18n.language) : null
                    const unit = lineUnitPrice(line.item, line.size)
                    return (
                      <li key={line.cartKey} className="flex gap-3">
                        {line.item.image_url && (
                          <img
                            src={line.item.image_url}
                            alt={name}
                            className="h-16 w-16 shrink-0 rounded-control object-cover"
                          />
                        )}
                        <div className="flex flex-1 flex-col gap-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-text">{name}</p>
                              {sizeName && <p className="text-xs text-textMuted">{sizeName}</p>}
                            </div>
                            <p className="whitespace-nowrap text-sm font-semibold text-text">
                              {formatPrice(unit * line.quantity)}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 rounded-control border border-border px-1.5 py-1">
                              <button
                                type="button"
                                onClick={() => updateQuantity(line.cartKey, line.quantity - 1)}
                                aria-label="Decrease quantity"
                                className="flex h-6 w-6 items-center justify-center rounded-control text-text hover:bg-surfaceAlt"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-4 text-center text-xs font-semibold text-text">
                                {line.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(line.cartKey, line.quantity + 1)}
                                aria-label="Increase quantity"
                                className="flex h-6 w-6 items-center justify-center rounded-control text-text hover:bg-surfaceAlt"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeLine(line.cartKey)}
                              className="flex items-center gap-1 text-xs text-textMuted hover:text-primary"
                            >
                              <Trash2 size={12} />
                              {t('cart.remove')}
                            </button>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {lines.length > 0 && (
              <div className="border-t border-border p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-textMuted">{t('cart.subtotal')}</span>
                  <span className="font-display text-lg font-semibold text-text">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-textMuted">{t('cart.reviewNote')}</p>
                {whatsappUrl && (
                  <button
                    type="button"
                    onClick={() => window.open(whatsappUrl, '_blank', 'noopener,noreferrer')}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-control bg-primary py-2.5 text-sm font-medium text-white hover:bg-primaryHover"
                  >
                    <MessageCircle size={16} />
                    {t('cart.orderWhatsapp')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={clearCart}
                  className="mt-3 w-full rounded-control border border-border py-2.5 text-sm font-medium text-text hover:border-primary"
                >
                  {t('cart.clear')}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
