'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '@/lib/schemas/password.schema';
import { mapChangePasswordError } from '@/lib/auth/map-password-error';
import { ROUTES } from '@/constants';
import type { ActionResult } from '@/types/action-result';

export async function changePassword(
  input: ChangePasswordFormValues,
): Promise<ActionResult> {
  // Re-validación en el servidor (nunca confiar en el cliente).
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: 'Tu sesión expiró. Volvé a iniciar sesión.' };
  }

  // supabase-js devuelve { error } (no lanza). current_password lo exige Supabase
  // cuando la opción "Require current password when updating" está activa en el
  // dashboard. NO VERIFICADO: qué hace Supabase con este campo cuando la opción
  // está apagada (puede ignorarlo o validarlo); se comprueba en el QA.
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
    current_password: parsed.data.currentPassword,
  });
  if (error) {
    // No se registra el input (contiene contraseñas): solo code + message.
    console.error('changePassword: error', { code: error.code, message: error.message });
    return {
      ok: false,
      error: mapChangePasswordError({ code: error.code, message: error.message }),
    };
  }

  return { ok: true };
}

// scope: 'local' invalida SOLO esta sesión (no cierra los otros dispositivos del
// usuario). Con este scope, si la llamada al servidor falla supabase-js igual
// elimina la sesión local y las cookies (solo ignora/limpia en 401/403/404) y
// devuelve { error }; en ese caso el refresh token queda sin revocar en el
// servidor hasta que venza. Por eso se ignora el error y se redirige a login.
// revalidatePath invalida la Router Cache para evitar que el shell del dashboard
// asome al navegar atrás.
export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut({ scope: 'local' });
  revalidatePath('/', 'layout');
  redirect(ROUTES.LOGIN);
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
    console.error('signOutOtherSessions: error', { code: error.code, message: error.message });
    return { ok: false, error: 'No se pudo cerrar las otras sesiones.' };
  }

  return { ok: true };
}
