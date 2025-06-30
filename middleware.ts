import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error('Middleware auth error:', error)
      // If there's an auth error, allow the request to continue
      // The client-side will handle the redirect if needed
      return supabaseResponse
    }

    // Define public routes that don't require authentication
    const publicRoutes = [
      '/', 
      '/auth', 
      '/pricing', 
      '/api/webhooks',
      '/api/create-checkout-session',
      '/api/stripe/webhooks'
    ]
    const isPublicRoute = publicRoutes.some(route => 
      request.nextUrl.pathname === route || 
      request.nextUrl.pathname.startsWith('/api/webhooks/') ||
      request.nextUrl.pathname.startsWith('/api/stripe/')
    )

    // If there's no user and they're trying to access a protected route
    if (!user && !isPublicRoute) {
      console.log('Unauthenticated user trying to access protected route:', request.nextUrl.pathname)
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/auth'
      return NextResponse.redirect(redirectUrl)
    }

    // If there's a user and they're trying to access the auth page
    if (user && request.nextUrl.pathname.startsWith('/auth')) {
      console.log('Authenticated user trying to access auth page, redirecting to dashboard')
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dashboard/sessions'
      return NextResponse.redirect(redirectUrl)
    }

    return supabaseResponse
  } catch (error) {
    console.error('Middleware error:', error)
    // If there's an error, allow the request to continue
    // The client-side will handle authentication
    return supabaseResponse
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 