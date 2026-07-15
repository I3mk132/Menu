import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ open, message, onConfirm, onCancel }) {
  const { t } = useTranslation()

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 z-40 bg-black/50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            role="alertdialog"
            aria-modal="true"
            className="fixed inset-x-4 top-1/3 z-50 mx-auto max-w-sm rounded-card border border-border bg-surface p-5"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="mt-0.5 shrink-0 text-primary" />
              <div>
                <h3 className="font-display text-base font-semibold text-text">
                  {t('admin.confirmDeleteTitle')}
                </h3>
                <p className="mt-1 text-sm text-textMuted">{message}</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-control border border-border px-4 py-2 text-sm text-text hover:border-primary"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="rounded-control bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primaryHover"
              >
                {t('common.delete')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
