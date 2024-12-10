import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the 'access_token' from cookies
  const token = request.cookies.get('access_token');
console.log(token);
  // If no token and the current URL is not '/login', redirect to '/login'
  if (!token && request.nextUrl.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If the token is found or the request is for the '/login' page, proceed as normal
  return NextResponse.next();

}
export const config = {
  matcher: ['/home','/profile', '/friends','/about', '/user-profile'],  // Define paths to protect
};


