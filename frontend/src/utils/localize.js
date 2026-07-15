/**
 * Menu content from the API is stored as separate `_en` / `_ar` / `_tr`
 * columns rather than nested objects, so this picks the right one for
 * the active language and falls back to English if it's missing.
 */
export function localized(record, field, lang) {
  return record[`${field}_${lang}`] || record[`${field}_en`] || ''
}

export function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`
}
