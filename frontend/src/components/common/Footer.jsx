import { useTranslation } from 'react-i18next'
import { MapPin, Mail, Phone } from 'lucide-react'
import { useTenant } from '../../context/TenantContext'

export default function Footer() {
  const { t } = useTranslation()
  const { tenant } = useTenant()

  const name = tenant?.name || t('app.name')
  const tagline = tenant?.description || t('footer.tagline')

  const hasContact = tenant?.address || tenant?.contact_email || tenant?.contact_phone

  return (
    <footer className="border-t border-border py-8 text-center">
      <p className="font-display text-base text-text">{name}</p>
      <p className="mt-1 text-sm text-textMuted">{tagline}</p>

      {hasContact && (
        <div className="mt-4 flex flex-col items-center gap-1.5 text-xs text-textMuted sm:flex-row sm:justify-center sm:gap-4">
          {tenant.address && (
            <span className="flex items-center gap-1.5">
              <MapPin size={12} />
              {tenant.address}
            </span>
          )}
          {tenant.contact_phone && (
            <a href={`tel:${tenant.contact_phone}`} className="flex items-center gap-1.5 hover:text-primary">
              <Phone size={12} />
              {tenant.contact_phone}
            </a>
          )}
          {tenant.contact_email && (
            <a href={`mailto:${tenant.contact_email}`} className="flex items-center gap-1.5 hover:text-primary">
              <Mail size={12} />
              {tenant.contact_email}
            </a>
          )}
        </div>
      )}

      <p className="mt-4 text-xs text-textMuted/70">{t('footer.poweredBy')}</p>
    </footer>
  )
}
