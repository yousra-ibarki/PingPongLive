// app/[locale]/About/page.js
"use client"

import React from 'react';
import About from './About';
import '../../globals.css';
import { useTranslation } from 'react-i18next';

export default function AboutPage() {
    const { t } = useTranslation('about');
    return (
    <div>
        <About />
    </div>
    )
}
