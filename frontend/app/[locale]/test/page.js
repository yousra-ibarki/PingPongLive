// app/[locale]/test/page.js
'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import '../../globals.css';


export default function TestPage() {
  const { t } = useTranslation();

  return (
    <div className="font-bold text-center mt-10">
      {t('title')}
      <p>
        {t('description')}
      </p>
    </div>
  );
}
