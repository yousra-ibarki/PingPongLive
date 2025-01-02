// app/[locale]/About/layout.js
import TranslationProvider from '@/components/TranslationsProvider';

export default function AboutLayout({ 
  children, 
  params: { locale } 
}) {
  return (
    <html lang={locale}>
      <body>
        <TranslationProvider lng={locale} ns="about">
          {children}
        </TranslationProvider>
      </body>
    </html>
  );
}