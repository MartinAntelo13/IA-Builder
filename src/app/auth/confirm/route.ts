import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ROUTES } from '@/constants';

// GET /auth/confirm — target de los links de email de invitación y recuperación.
// Supabase los construye como {{ .RedirectTo }}?token_hash=…&type=invite|recovery.
// Esta ruta valida type contra una lista permitida y ejecuta verifyOtp:
//   - invite: éxito -> /set-password, error -> /login?error=invitacion_invalida
//   - recovery: éxito -> /reset-password, error -> /forgot-password?error=enlace_invalido
// Ignora cualquier parámetro "next" / "redirect_to" para no abrir una puerta de
// open redirect: el destino de éxito y de error es fijo por tipo.
const ALLOWED_TYPES = ['invite', 'recovery'] as const;
type ConfirmType = typeof ALLOWED_TYPES[number];

function isAllowedType(value: string | null): value is ConfirmType {
  return value !== null && (ALLOWED_TYPES as readonly string[]).includes(value);
}

function buildErrorUrl(type: ConfirmType | null, request: NextRequest) {
  if (type === 'recovery') {
    return new URL(`${ROUTES.FORGOT_PASSWORD}?error=enlace_invalido`, request.url);
  }
  return new URL(`${ROUTES.LOGIN}?error=invitacion_invalida`, request.url);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const typeParam = searchParams.get('type');
  const type: ConfirmType | null = isAllowedType(typeParam) ? typeParam : null;

  if (!tokenHash || type === null) {
    return NextResponse.redirect(buildErrorUrl(type, request));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

  if (error) {
    return NextResponse.redirect(buildErrorUrl(type, request));
  }

  const successPath = type === 'recovery' ? ROUTES.RESET_PASSWORD : ROUTES.SET_PASSWORD;
  return NextResponse.redirect(new URL(successPath, request.url));
}
