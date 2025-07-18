
import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET || 'your-super-secret-key-that-is-long-enough';
const key = new TextEncoder().encode(SECRET_KEY);

// List of public paths that don't require authentication
const publicPaths = ['/', '/dbedit'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  // Allow access to public paths and API routes without a token
  if (publicPaths.includes(pathname) || pathname.startsWith('/api')) {
    // If user is logged in and tries to access login/signup, redirect to dashboard
    // But allow access to /dbedit even if logged in
    if (token && publicPaths.includes(pathname) && pathname !== '/dbedit') {
        try {
            const { payload } = await jwtVerify(token, key);
            const destination = (payload as any).role === 'admin' ? '/admin/users' : '/dashboard';
            return NextResponse.redirect(new URL(destination, request.url));
        } catch (e) {
            // Invalid token, let them stay on the public page
            return NextResponse.next();
        }
    }
    return NextResponse.next();
  }

  // For protected routes, check for a valid token
  if (!token) {
    // Redirect to login page if no token
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    // Verify the token
    const { payload } = await jwtVerify(token, key);
    
    // Check if a non-admin user is trying to access an admin route
    if ((payload as any).role !== 'admin' && pathname.startsWith('/admin')) {
      // Redirect non-admins away from admin pages
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // Check if an admin user is trying to access a non-admin student route
    if ((payload as any).role === 'admin' && !pathname.startsWith('/admin') && pathname !== '/profile') {
        return NextResponse.redirect(new URL('/admin/users', request.url));
    }

    // Token is valid, allow the request to proceed
    return NextResponse.next();
  } catch (err) {
    // Token is invalid (expired, malformed, etc.), redirect to login
    // We also delete the invalid cookie
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete('auth_token');
    return response;
  }
}

// Define which paths the middleware should run on
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
