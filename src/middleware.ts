
import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET || 'your-super-secret-key-that-is-long-enough';
const key = new TextEncoder().encode(SECRET_KEY);

// List of public paths that don't require authentication
const publicPaths = ['/', '/signup', '/dbedit', '/change-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  // Allow access to public paths and API routes without a token
  if (publicPaths.includes(pathname) || pathname.startsWith('/api')) {
    if (token && publicPaths.includes(pathname) && pathname !== '/dbedit' && pathname !== '/change-password') {
        try {
            const { payload } = await jwtVerify(token, key) as any;
            const destination = payload.role === 'admin' ? '/admin/users' : '/dashboard';
            return NextResponse.redirect(new URL(destination, request.url));
        } catch (e) {
            return NextResponse.next();
        }
    }
    return NextResponse.next();
  }

  // For protected routes, check for a valid token
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, key) as any;
    
    if (payload.role !== 'admin' && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    if (payload.role === 'admin' && !pathname.startsWith('/admin') && pathname !== '/profile' && pathname !== '/change-password') {
        return NextResponse.redirect(new URL('/admin/users', request.url));
    }

    return NextResponse.next();
  } catch (err) {
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete('auth_token');
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
