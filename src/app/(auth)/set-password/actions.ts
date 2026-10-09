'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ROUTES } from '@/constants';
import { passwordSchema, type PasswordFormValues } from '@/lib/schemas/password.schema';
import { mapPasswordError } from '@/lib/auth/map-password-error';
import type { ActionResult } from '@/types/action-result';

export async function setInitialPassword(
  input: PasswordFormValues,
): Promise<ActionResult> {
  // La action nunca confía en el cliente: valida de nuevo con el mismo schema.
  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  }

  const supabase = await createSupabaseServerClient();

  // getUser garantiza que haya una sesión válida (puesta por verifyOtp).
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: 'Tu sesión expiró. Volvé a abrir el link de invitación.' };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { ok: false, error: mapPasswordError(error.message) };
  }

  // Éxito: redirect lanza NEXT_REDIRECT y el cliente recibe la navegación.
  redirect(ROUTES.HOME);
}
