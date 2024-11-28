// components/TranslationProvider.js
'use client';

import { I18nextProvider } from 'react-i18next';
import { useState, useEffect } from 'react';
import initI18next from '@/app/i18n';

export default function TranslationProvider({ 
  children, 
  lng, 
  ns = 'common' 
}) {
  const [i18nInstance, setI18nInstance] = useState(null);

  useEffect(() => {
    const instance = initI18next(lng, ns);
    setI18nInstance(instance);

    return () => {
      instance.off('languageChanged');
    };
  }, [lng, ns]);

  if (!i18nInstance) {
    return null;
  }

  return (
    <I18nextProvider lng={locale} ns={['common']}>
      {children}
    </I18nextProvider>
  );
}