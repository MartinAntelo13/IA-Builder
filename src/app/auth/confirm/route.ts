import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ROUTES } from '@/constants';

// GET /auth/confirm — target del link del mail de invitación
// (Supabase lo construye como {{ .RedirectTo }}?token_hash=…&type=invite).
// Esta ruta solo acepta type === 'invite'. Ignora cualquier parámetro
// "next" / "redirect_to" para no abrir una puerta de open redirect: el destino
// de éxito es siempre /set-password; el de error, /login con un flag.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');

  const errorUrl = new URL(`${ROUTES.LOGIN}?error=invitacion_invalida`, request.url);

  if (!tokenHash || type !== 'invite') {
    return NextResponse.redirect(errorUrl);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({
    type: 'invite',
    token_hash: tokenHash,
  });

  if (error) {
    return NextResponse.redirect(errorUrl);
  }

  return NextResponse.redirect(new URL(ROUTES.SET_PASSWORD, request.url));
}
