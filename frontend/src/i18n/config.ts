import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// TR locales
import trCommon from './locales/tr/common.json';
import trAuth from './locales/tr/auth.json';
import trOrganization from './locales/tr/organization.json';

// EN locales
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enOrganization from './locales/en/organization.json';

const tr = {
  ...trCommon,
  ...trAuth,
  ...trOrganization,
};

const en = {
  ...enCommon,
  ...enAuth,
  ...enOrganization,
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    tr: { translation: tr },
  },
  lng: 'tr',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
