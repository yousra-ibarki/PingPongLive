import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

async function validateToken(token: string, baseUrl: string) {
  try {
    const response = await fetch(`${baseUrl}/api/user_profile/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return true;
  } catch (error) {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token');

  if (!token && request.nextUrl.pathname !== '/login' && request.nextUrl.pathname !== '/callback') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token) {
    const baseUrl = request.nextUrl.origin;
    const isValid = await validateToken(token.value, baseUrl);
    
    if (!isValid && request.nextUrl.pathname !== '/login') {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('access_token');
      return response;
    } 
    // else if (isValid && request.nextUrl.pathname === '/login') {
    //   return NextResponse.redirect(new URL('/dashboard', request.url));
    // }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard',
    '/profile',
    '/game',
    '/tournament',
    '/leaderboard',
    '/settings',
    '/chat',
    '/friends',
    '/home',
    '/NavBar',
    '/localGame',
    '/login',
    '/callback',
  ],
};