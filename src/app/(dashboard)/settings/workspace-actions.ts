'use server';

import { revalidatePath } from 'next/cache';
import {
  createSupabaseServerClient,
  getCurrentProfile,
} from '@/lib/supabase/server';
import { getUserPermissions } from '@/lib/auth/permissions';
import { ROUTES, PERMISSIONS } from '@/constants';
import {
  workspaceSchema,
  type WorkspaceFormValues,
} from '@/lib/schemas/workspace.schema';
import { isSupportedTimezone } from '@/lib/timezones';
import type { Database } from '@/types/database.types';
import type { ActionResult } from '@/types/action-result';

// Mismas columnas del grant update(name, domain, description, currency_code,
// currency_symbol, timezone, support_email) sobre organizations.
type OrganizationUpdate = Pick<
  Database['public']['Tables']['organizations']['Update'],
  | 'name'
  | 'domain'
  | 'description'
  | 'currency_code'
  | 'currency_symbol'
  | 'timezone'
  | 'support_email'
>;

export async function updateWorkspace(
  input: WorkspaceFormValues,
): Promise<ActionResult> {
  // 1) Validación en el servidor (no confiar en el cliente ni en el ocultamiento
  //    de la pestaña).
  const parsed = workspaceSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  }

  // 2) Permiso: la Server Action re-chequea org.manage por si la pestaña fue
  //    forzada desde la URL.
  const permissions = await getUserPermissions();
  if (!permissions.has(PERMISSIONS.ORG_MANAGE)) {
    return { ok: false, error: 'No tenés permisos para editar la organización.' };
  }

  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: 'Tu sesión expiró. Volvé a iniciar sesión.' };

  const tz = parsed.data.timezone.trim();
  if (!isSupportedTimezone(tz)) {
    return { ok: false, error: 'Zona horaria no soportada.' };
  }

  const domain = parsed.data.domain.trim();
  const description = parsed.data.description.trim();
  const supportEmail = parsed.data.supportEmail.trim();

  // EXCEPTION (Regla 10): no hay RPC de edición de organización. Payload
  // acotado a las columnas del grant update; los triggers no tocan nada.
  const payload: OrganizationUpdate = {
    name: parsed.data.name.trim(),
    domain: domain === '' ? null : domain.toLowerCase(),
    description: description === '' ? null : description,
    currency_code: parsed.data.currencyCode.trim().toUpperCase(),
    currency_symbol: parsed.data.currencySymbol.trim(),
    timezone: tz,
    support_email: supportEmail === '' ? null : supportEmail,
  };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('organizations')
    .update(payload)
    .eq('id', profile.organizationId)
    .select('id')
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) {
    return { ok: false, error: 'No se pudo guardar los cambios.' };
  }

  revalidatePath(ROUTES.SETTINGS);
  return { ok: true };
}
