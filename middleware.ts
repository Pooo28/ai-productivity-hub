import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Skip Supabase check for internal Next.js paths and static assets
  const isInternalPath = request.nextUrl.pathname.startsWith('/_next') || 
                         request.nextUrl.pathname.includes('/favicon.ico') ||
                         request.nextUrl.pathname.includes('/not-found');

  let user = null;
  if (!isInternalPath) {
    try {
      // IMPORTANT: DO NOT REMOVE THIS. It refreshes the session if needed.
      const { data: { user: authUser } } = await supabase.auth.getUser()
      user = authUser;
    } catch (e) {
      console.error('Middleware: Supabase auth check failed', e);
    }
  }
  
  // Debug log
  if (!isInternalPath) {
    console.log(`Middleware tracing path: ${request.nextUrl.pathname}, user: ${user?.email || 'none'}`)
  }

  // No protected routes for now to allow users to use features freely
  const protectedRoutes = ['/notes', '/youtube', '/jobs', '/schedule']
  const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  if (isProtectedRoute && !user) {
    console.log(`Middleware: Redirecting to login from ${request.nextUrl.pathname}`)
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // If user is already logged in and tries to go to login page, redirect to dashboard
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    console.log(`Middleware: Already logged in, redirecting from ${request.nextUrl.pathname} to /`)
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
