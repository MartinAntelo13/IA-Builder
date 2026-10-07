import { cache } from 'react';
import { getCurrentProfile, createSupabaseServerClient } from '@/lib/supabase/server';

// EXCEPTION (Regla 10): no existe RPC de permisos del usuario.
// Una sola query: obtiene TODOS los permission_code de los roles del usuario.
// Cadena de dependencias:
//   A — getCurrentProfile() cacheado (auth + user_roles + roles ya resueltos)
//   B — roles.id a partir de sus codes dentro de la organización
//   C — role_permissions WHERE role_id IN ids (todos los permisos en una sola query)
export const getUserPermissions = cache(async (): Promise<Set<string>> => {
  try {
    const profile = await getCurrentProfile();
    if (!profile || profile.roles.length === 0) return new Set();

    const supabase = await createSupabaseServerClient();
    const roleCodes = profile.roles.map((r) => r.code);

    // B: IDs de los roles del usuario (filtrados por organización vía RLS)
    const { data: roleRows } = await supabase
      .from('roles')
      .select('id')
      .eq('organization_id', profile.organizationId)
      .in('code', roleCodes);

    if (!roleRows || roleRows.length === 0) return new Set();

    const roleIds = roleRows.map((r) => r.id);

    // C: todos los permisos de esos roles en una sola query
    const { data: perms } = await supabase
      .from('role_permissions')
      .select('permission_code')
      .in('role_id', roleIds);

    return new Set((perms ?? []).map((p) => p.permission_code));
  } catch {
    return new Set();
  }
});

export async function hasPermission(code: string): Promise<boolean> {
  return (await getUserPermissions()).has(code);
}
