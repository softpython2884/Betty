
import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET || 'your-super-secret-key-that-is-long-enough';
const key = new TextEncoder().encode(SECRET_KEY);

const publicPaths = ['/', '/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  const isPublicPath = publicPaths.includes(pathname);
  const isApiPath = pathname.startsWith('/api');

  // If user is logged in
  if (token) {
    try {
      const { payload } = await jwtVerify(token, key);
      const userRole = (payload as any).role;

      // If on a public path (login/signup), redirect to the appropriate dashboard
      if (isPublicPath) {
        const url = userRole === 'admin' ? '/admin/users' : '/dashboard';
        return NextResponse.redirect(new URL(url, request.url));
      }

      // If trying to access admin routes without admin role, redirect
      if (pathname.startsWith('/admin') && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
      // Allow access to other protected routes
      return NextResponse.next();

    } catch (err) {
      // Invalid token, redirect to login and clear cookie
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }

  // If user is not logged in
  // Allow access to public paths and API routes
  if (isPublicPath || isApiPath) {
    return NextResponse.next();
  }

  // For any other protected path, redirect to login
  return NextResponse.redirect(new URL('/', request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
