// i18nConfig.js
export const fallbackLng = 'en';
export const languages = ['en', 'fr', 'de']; // Add your supported languages
export const defaultNS = 'common';

export function getOptions(lng = fallbackLng, ns = defaultNS) {
  return {
    supportedLngs: languages,
    fallbackLng,
    lng,
    ns,
  };
}