'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ROUTES } from '@/constants';
import { resolveOrigin } from '@/lib/auth/resolve-origin';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations/auth.schema';
import type { ActionResult } from '@/types/action-result';
import { firstIssueMessage } from '@/lib/errors/first-issue-message';

// Mapeo de errores de supabase.auth.resetPasswordForEmail.
//   over_email_send_rate_limit / status 429: Supabase devuelve rate limit.
//   Resto: mensaje genérico — nunca filtramos el texto crudo de Supabase.
function mapResetEmailError(code: string | undefined, status: number | undefined): string {
  if (code === 'over_email_send_rate_limit' || status === 429) {
    return 'Esperá un minuto antes de pedir otro enlace.';
  }
  return 'No pudimos enviar el correo. Intentá de nuevo en unos minutos.';
}

export async function forgotPassword(input: ForgotPasswordInput): Promise<ActionResult> {
  // La action nunca confía en el cliente: valida de nuevo con el mismo schema.
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstIssueMessage(parsed.error) };
  }

  const supabase = await createSupabaseServerClient();
  const redirectTo = `${await resolveOrigin()}${ROUTES.AUTH_CONFIRM}`;
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo });

  if (error) {
    console.error('forgotPassword: error', { code: error.code, message: error.message });
    return { ok: false, error: mapResetEmailError(error.code, error.status) };
  }

  // Devolvemos ok: true aun si el email no existe — no revelamos qué cuentas
  // tienen usuario. Supabase ya aplica esta política internamente.
  return { ok: true };
}
