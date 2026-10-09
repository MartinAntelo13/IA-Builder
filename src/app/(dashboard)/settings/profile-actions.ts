'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ROUTES } from '@/constants';
import {
  profileSchema,
  type ProfileFormValues,
} from '@/lib/schemas/profile.schema';
import { isSupportedTimezone } from '@/lib/timezones';
import type { Database } from '@/types/database.types';
import type { ActionResult } from '@/types/action-result';

// Columnas efectivamente editables desde el formulario (coinciden con el grant
// update por columna de profiles: solo full_name y timezone del formulario).
type ProfileUpdate = Pick<
  Database['public']['Tables']['profiles']['Update'],
  'full_name' | 'timezone'
>;

export async function updateProfile(input: ProfileFormValues): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Tu sesión expiró. Volvé a iniciar sesión.' };

  // '' se guarda como null (usar la zona de la organización). Nunca mandar ''
  // a una columna textual con contenido semántico.
  const tz = parsed.data.timezone?.trim() ?? '';
  if (tz && !isSupportedTimezone(tz)) {
    return { ok: false, error: 'Zona horaria no soportada.' };
  }

  // EXCEPTION (Regla 10): no hay RPC de edición de perfil. El grant por columna
  // en profiles habilita update de full_name y timezone (entre otras); el trigger
  // profiles_guard_update bloquea cambios en email y en columnas sensibles.
  const payload: ProfileUpdate = {
    full_name: parsed.data.fullName.trim(),
    timezone: tz === '' ? null : tz,
  };

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', user.id)
    .select('id')
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) {
    // RLS filtró la fila (0 filas afectadas sin error): mensaje genérico.
    return { ok: false, error: 'No se pudo guardar los cambios.' };
  }

  revalidatePath(ROUTES.SETTINGS);
  return { ok: true };
}
