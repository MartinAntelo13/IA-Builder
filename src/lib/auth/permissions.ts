import { cache } from 'react';
import { getCurrentProfile, createSupabaseServerClient } from '@/lib/supabase/server';

// EXCEPTION (Regla 10): no existe RPC de permisos del usuario.
// Una sola query con join embebido: user_roles → roles → role_permissions.
// Los embeds nombran la FK de forma explícita porque son claves compuestas
// (role_id + organization_id).
//   A — getCurrentProfile() cacheado (auth + user_roles + roles ya resueltos)
//   B — user_roles del usuario con los permission_code de cada rol
export const getUserPermissions = cache(async (): Promise<Set<string>> => {
  const profile = await getCurrentProfile();
  if (!profile || profile.roles.length === 0) return new Set();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('user_roles')
    .select('roles!user_roles_role_id_organization_id_fkey!inner(role_permissions!role_permissions_role_id_organization_id_fkey(permission_code))')
    .eq('user_id', profile.id);

  if (error) throw new Error(error.message);

  const codes = new Set<string>();
  for (const row of data ?? []) {
    for (const rp of row.roles.role_permissions) codes.add(rp.permission_code);
  }
  return codes;
});

export async function hasPermission(code: string): Promise<boolean> {
  return (await getUserPermissions()).has(code);
}
