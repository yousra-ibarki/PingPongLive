import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

async function validateToken(token, baseUrl) {
  try {
    const response = await fetch(`${baseUrl}/api/health/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

export function middleware(request) {
  // Get the 'access_token' from cookies
  const token = request.cookies.get('access_token');
  const { pathname, origin } = request.nextUrl;

  // If no token and the current URL is not '/login', redirect to '/login'
  if (!token && pathname !== '/login' && pathname !== '/callback') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const isValid = validateToken(token, origin);
  // If the token is found, validate it
  if (token) {
    if (!isValid && pathname !== '/login') {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('access_token');
    } 
    // else if (isValid && pathname === '/login') {
    //   return NextResponse.redirect(new URL('/dashboard', request.url));
    // }
  }
  
  // If the token is found or the request is for the '/login' page, proceed as normal
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
      '/connections',
      '/home',
      '/NavBar',
      '/localGame',
      // '/user-profile',
      // '/user-profile/[userId]',
      '/login',
      '/callback',
    ],
  };