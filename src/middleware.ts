import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  exp?: number;
}

function parseJwtPayload(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    // Check expiration
    if (parsed.exp && Date.now() >= parsed.exp * 1000) {
      return null;
    }
    return parsed;
  } catch (err) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('vll_session')?.value;
  const user = token ? parseJwtPayload(token) : null;

  // 1. Admin route protection
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = new URL('/masuk', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== 'ADMIN') {
      // Forbidden: redirect to student dashboard
      return NextResponse.redirect(new URL('/dashboard?error=unauthorized_admin', request.url));
    }
  }

  // 2. User Dashboard protection
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const loginUrl = new URL('/masuk', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Prevent logged in users from visiting auth pages (/masuk, /daftar)
  if ((pathname === '/masuk' || pathname === '/daftar') && user) {
    if (user.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/masuk', '/daftar'],
};
