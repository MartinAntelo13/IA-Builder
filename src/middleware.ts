import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from './lib/env';
import { ROUTES } from './constants';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes: (dashboard) group
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');

  if (isDashboardRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.LOGIN;
    return NextResponse.redirect(url);
  }

  // /set-password requiere sesión: el usuario la obtiene vía verifyOtp en
  // /auth/confirm. Sin sesión → al login. /auth/confirm sigue público
  // (no está en la condición de arriba y tampoco acá).
  if (request.nextUrl.pathname === ROUTES.SET_PASSWORD && !user) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.LOGIN;
    return NextResponse.redirect(url);
  }

  // TODO: migrar middleware → proxy del nuevo API de Next.js (deuda).

  // If user is logged in and tries to access auth pages, redirect to home
  // TEMPORARILY COMMENTED OUT to allow login page to handle authenticated users
  // const isAuthRoute =
  //   request.nextUrl.pathname === ROUTES.LOGIN ||
  //   request.nextUrl.pathname === ROUTES.FORGOT_PASSWORD;
  //
  // if (isAuthRoute && user) {
  //   const url = request.nextUrl.clone();
  //   url.pathname = ROUTES.HOME;
  //   return NextResponse.redirect(url);
  // }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};