import { cache } from 'react';
import { getCurrentProfile, createSupabaseServerClient } from '@/lib/supabase/server';

// EXCEPTION (Regla 10): no existe RPC de permisos del usuario.
// getCurrentProfile ya consultó auth + user_roles + roles en este request (cache()).
// Como solo expone code/name de roles (no IDs), resolvemos en dos pasos:
//   B: roles.id a partir de sus codes dentro de la organización
//   C: UNA query a role_permissions para verificar el permiso solicitado
// Cadena de dependencias:
//   A — getCurrentProfile() cacheado (auth + user_roles + roles ya resueltos)
//   B — roles.id desde los codes del perfil (necesita profile.organizationId y roleCodes)
//   C — role_permissions (necesita los roleIds de B)
export const hasPermission = cache(async (code: string): Promise<boolean> => {
  // A: perfil con roles — cacheado, sin roundtrips adicionales al backend
  const profile = await getCurrentProfile();
  if (!profile || profile.roles.length === 0) return false;

  const supabase = await createSupabaseServerClient();
  const roleCodes = profile.roles.map((r) => r.code);

  // B: IDs de los roles del usuario (filtrados por organización vía RLS)
  const { data: roleRows } = await supabase
    .from('roles')
    .select('id')
    .eq('organization_id', profile.organizationId)
    .in('code', roleCodes);

  if (!roleRows || roleRows.length === 0) return false;

  const roleIds = roleRows.map((r) => r.id);

  // C: UNA query a role_permissions para verificar el permiso
  const { data: perms } = await supabase
    .from('role_permissions')
    .select('permission_code')
    .in('role_id', roleIds)
    .eq('permission_code', code)
    .limit(1);

  return (perms?.length ?? 0) > 0;
});
