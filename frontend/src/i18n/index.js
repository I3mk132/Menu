import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './en.json'
import ar from './ar.json'
import tr from './tr.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      tr: { translation: tr },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar', 'tr'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export const RTL_LANGUAGES = ['ar']

export default i18n
