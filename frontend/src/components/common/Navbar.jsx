import { useTranslation } from 'react-i18next'
import { ShoppingBag, UtensilsCrossed } from 'lucide-react'
import { motion } from 'framer-motion'

import LanguageSwitcher from './LanguageSwitcher'
import { useCart } from '../../context/CartContext'
import { useTenant } from '../../context/TenantContext'

export default function Navbar() {
  const { t } = useTranslation()
  const { itemCount, setIsOpen } = useCart()
  const { tenant } = useTenant()

  const displayName = tenant?.name || t('app.name')

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-text sm:text-xl">
          {tenant?.logo_url ? (
            <img
              src={tenant.logo_url}
              alt={displayName}
              className="h-8 w-8 shrink-0 rounded-control object-contain"
            />
          ) : (
            <UtensilsCrossed size={22} className="shrink-0 text-primary" />
          )}
          <span className="truncate">{displayName}</span>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label={t('cart.title')}
            className="relative flex items-center gap-1.5 rounded-control bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primaryHover"
          >
            <ShoppingBag size={16} strokeWidth={2} />
            {itemCount > 0 && (
              <motion.span
                key={itemCount}
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                className="ms-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-black"
              >
                {itemCount}
              </motion.span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
