'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  passwordSchema,
  type PasswordFormValues,
} from '@/lib/schemas/password.schema';
import { mapPasswordError } from '@/lib/auth/map-password-error';
import type { ActionResult } from '@/types/action-result';

export async function changePassword(
  input: PasswordFormValues,
): Promise<ActionResult> {
  // Re-validación en el servidor (nunca confiar en el cliente).
  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: 'Tu sesión expiró. Volvé a iniciar sesión.' };
  }

  // supabase-js devuelve { error } (no lanza).
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { ok: false, error: mapPasswordError(error.message) };

  return { ok: true };
}

export async function signOutOtherSessions(): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: 'Tu sesión expiró. Volvé a iniciar sesión.' };
  }

  // scope: 'others' invalida todas las sesiones del usuario SALVO la actual.
  const { error } = await supabase.auth.signOut({ scope: 'others' });
  if (error) {
    return { ok: false, error: error.message || 'No se pudo cerrar las otras sesiones.' };
  }

  return { ok: true };
}
