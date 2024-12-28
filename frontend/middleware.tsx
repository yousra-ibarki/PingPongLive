import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';


export function middleware(request: NextRequest) {
  // Get the 'access_token' from cookies
  const token = request.cookies.get('access_token');

  // If no token and the current URL is not '/login', redirect to '/login'
  // if (!token && request.nextUrl.pathname !== '/login' && request.nextUrl.pathname !== '/callback') {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  // // check if the the user is trying to access the login page and they are already logged in
  // if (token && request.nextUrl.pathname === '/login') {
  //   return NextResponse.redirect(new URL('/dashboard', request.url));
  // }
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
      '/friends',
      '/home',
      '/NavBar',
      '/localGame',
      // '/user-profile',
      // '/user-profile/[userId]',
      '/login',
      '/callback',
    ],
  };
