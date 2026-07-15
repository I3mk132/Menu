import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { localized, formatPrice } from '../../utils/localize'

export default function ItemCard({ item, onSelect }) {
  const { t, i18n } = useTranslation()
  const name = localized(item, 'name', i18n.language)
  const description = localized(item, 'description', i18n.language)
  const hasDiscount = item.discounted_price != null && item.discounted_price < item.price
  const discountPct = hasDiscount
    ? Math.round(100 - (item.discounted_price / item.price) * 100)
    : 0

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(item)}
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="group flex flex-col overflow-hidden rounded-card border border-border bg-surface text-start shadow-card"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surfaceAlt">
        {item.image_url && (
          <img
            src={item.image_url}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {hasDiscount && (
          <span className="absolute start-3 top-3 rounded-control bg-accent px-2 py-1 text-xs font-bold text-black">
            {discountPct}% {t('item.off')}
          </span>
        )}
        {!item.is_available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="rounded-control bg-white/90 px-3 py-1 text-xs font-semibold text-black">
              {t('item.unavailable')}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-display text-lg font-semibold leading-snug text-text">{name}</h3>
        {description && (
          <p className="line-clamp-2 text-sm text-textMuted">{description}</p>
        )}
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          {hasDiscount ? (
            <>
              <span className="font-display text-base font-semibold text-primary">
                {formatPrice(item.discounted_price)}
              </span>
              <span className="text-sm text-textMuted line-through">{formatPrice(item.price)}</span>
            </>
          ) : (
            <span className="font-display text-base font-semibold text-primary">
              {formatPrice(item.price)}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  )
}
