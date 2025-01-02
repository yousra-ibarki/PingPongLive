// app/[locale]/test/layout.js
import TranslationProvider from '@/components/TranslationsProvider';

export default function RootLayout({ 
  children, 
  params: { locale } 
}) {
  return (
    <html lang={locale}>
      <body>
        <TranslationProvider lng={locale}>
          {children}
        </TranslationProvider>
      </body>
    </html>
  );
}