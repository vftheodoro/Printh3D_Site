import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

function getJwtSecret(): Uint8Array {
  const secretKey = process.env.ADMIN_JWT_SECRET;
  if (!secretKey) {
    throw new Error('Missing ADMIN_JWT_SECRET environment variable.');
  }
  return new TextEncoder().encode(secretKey);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isProtectedPath = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const isPublicPath = pathname === '/admin/login' || pathname === '/api/admin/login' || pathname === '/api/admin/init';

  // Protect all /admin and /api/admin routes except the login and init routes
  if (isProtectedPath && !isPublicPath) {
    let jwtSecret: Uint8Array;
    try {
      jwtSecret = getJwtSecret();
    } catch {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Server configuration error: ADMIN_JWT_SECRET is required.' }, { status: 500 });
      }
      return NextResponse.redirect(new URL('/admin/login?error=config', request.url));
    }

    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      await jwtVerify(token, jwtSecret);
      return NextResponse.next();
    } catch (error) {
      // Invalid token
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('admin_token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
