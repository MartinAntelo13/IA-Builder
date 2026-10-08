'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ROUTES } from '@/constants';
import { passwordSchema, type PasswordFormValues } from '@/lib/schemas/password.schema';
import type { ActionResult } from '@/types/action-result';

// Traducción de errores de supabase.auth.updateUser. Supabase devuelve el
// mensaje en inglés con palabras clave sobre la política de contraseña.
function mapPasswordError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('weak') || m.includes('short') || m.includes('at least')) {
    return 'La contraseña no cumple los requisitos de seguridad. Elegí una más robusta.';
  }
  if (m.includes('same') || m.includes('previous')) {
    return 'La nueva contraseña no puede ser igual a la anterior.';
  }
  return message || 'No se pudo guardar la contraseña.';
}

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
