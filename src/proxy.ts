// Proxy: se ejecuta en cada request antes de renderizar.
// Refresca la sesión de Supabase (getUser + cookies getAll/setAll) para que
// los Server Components siempre lean cookies actualizadas.
// Exige sesión activa en /set-password y /reset-password; cualquier otra
// protección de rutas del dashboard se resuelve en
// src/app/(dashboard)/layout.tsx vía getCurrentProfile.
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/env';
import { ROUTES } from '@/constants';

export async function proxy(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value }) =>
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

  // /set-password y /reset-password requieren sesión: el usuario la obtiene
  // vía verifyOtp en /auth/confirm (type=invite o type=recovery). Sin sesión
  // → al login. /auth/confirm sigue público (no está en ninguna condición).
  const requiresSession =
    request.nextUrl.pathname === ROUTES.SET_PASSWORD ||
    request.nextUrl.pathname === ROUTES.RESET_PASSWORD;
  if (requiresSession && !user) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.LOGIN;
    return NextResponse.redirect(url);
  }

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
