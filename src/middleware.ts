import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // 1. Authenticated Users
    if (token) {
      // Redirect from Login or Root to /problems
      if (
        pathname === '/login' ||
        pathname.startsWith('/auth') ||
        pathname === '/'
      ) {
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
  },
  {
    callbacks: {
      authorized: () => {
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
