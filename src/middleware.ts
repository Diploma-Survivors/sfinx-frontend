import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const secret = process.env.NEXTAUTH_SECRET;

  const token = await getToken({
    req,
    secret,
    cookieName: 'next-auth.session-token.user',
  });

  // 1. Authenticated Users
  if (token) {
    // Redirect from Login or Root or Auth pages to /problems
    if (pathname === '/login' || pathname.startsWith('/auth') || pathname === '/') {
      return NextResponse.redirect(new URL('/problems', req.url));
    }
  }
  // 2. Unauthenticated Users
  else {
    // Redirect from Root to /login
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
