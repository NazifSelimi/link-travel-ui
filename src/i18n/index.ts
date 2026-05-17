import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import mk from './locales/mk.json';
import shq from './locales/shq.json';

/**
 * Supported UI locales.
 *
 * Codes match the backend's SetLocale middleware (`en | mk | shq`). Albanian
 * is spelled `shq` here too rather than the ISO 639-1 `sq` because that's
 * what the API's translation tables, Resources, and admin form payloads use.
 * Keeping a single code across the stack avoids a round-trip translation
 * that would only invite bugs.
 */
export const SUPPORTED_LOCALES = ['en', 'mk', 'shq'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = 'en';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en:  { translation: en  },
      mk:  { translation: mk  },
      shq: { translation: shq },
    },
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: SUPPORTED_LOCALES,
    nonExplicitSupportedLngs: false,
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      // Look in localStorage first (so a user's manual choice sticks across
      // sessions), then navigator. We deliberately don't honour ?lng= in the
      // URL — the API treats `?locale=` as the source of truth for *response*
      // content; mirroring that would let a deep link change the UI chrome
      // independently of the active i18next state, which is confusing.
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'linktravel.locale',
      caches: ['localStorage'],
    },
  });

export default i18n;
