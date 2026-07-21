import { localized, formatPrice } from './localize'

// Static message labels, keyed by the tenant's fixed order_language.
// This is deliberately independent of the customer's UI language: the order
// message is written in whatever language the restaurant chose to read.
const LABELS = {
  en: { header: 'New order', subtotal: 'Subtotal' },
  ar: { header: 'طلب جديد', subtotal: 'المجموع' },
  tr: { header: 'Yeni sipariş', subtotal: 'Ara toplam' },
}

/**
 * Builds a wa.me deep link with a pre-filled order message.
 *
 * @param {object} tenant        tenant config (needs whatsapp_number, order_language)
 * @param {Array}  lines         cart lines ({ item, size, quantity })
 * @param {number} subtotal      cart subtotal
 * @param {Function} lineUnitPrice (item, size) => unit price
 * @returns {string|null} wa.me URL, or null if no WhatsApp number configured
 */
export function buildWhatsappOrderUrl(tenant, lines, subtotal, lineUnitPrice) {
  const digits = String(tenant?.whatsapp_number || '').replace(/\D/g, '')
  if (!digits || !lines?.length) return null

  const lang = LABELS[tenant?.order_language] ? tenant.order_language : 'en'
  const labels = LABELS[lang]

  const lineText = lines.map((line) => {
    const name = localized(line.item, 'name', lang)
    const size = line.size ? ` (${localized(line.size, 'name', lang)})` : ''
    const lineTotal = lineUnitPrice(line.item, line.size) * line.quantity
    return `${line.quantity}x ${name}${size} — ${formatPrice(lineTotal)}`
  })

  const msg = [
    labels.header,
    '',
    ...lineText,
    '',
    `${labels.subtotal}: ${formatPrice(subtotal)}`,
  ].join('\n')

  return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`
}
