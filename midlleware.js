// middleware.js
import { NextResponse } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { languages, fallbackLng } from './i18nConfig';

function getLocale(request) {
  const headers = { 'accept-language': request.headers.get('accept-language') || 'en-US' };
  const languages = new Negotiator({ headers }).languages();
  return match(languages, supportedLanguages, fallbackLng);
}

export function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const pathnameIsMissingLocale = languages.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};