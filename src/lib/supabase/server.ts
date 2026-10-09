import { cache } from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';
import type { Database } from '@/types/database.types';

export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};

/**
 * Forma combinada que devuelve getCurrentProfile(): no es una tabla ni una RPC
 * generada por Supabase (es un objeto armado a mano uniendo profiles + roles +
 * organizations), así que se construye explícitamente a partir de los tipos
 * reales de cada tabla (Regla 7) en vez de dejarlo implícito o duplicarlo a
 * mano en cada componente que lo consume (p. ej. sidebar.tsx).
 */
export type CurrentProfile = {
  id: Database['public']['Tables']['profiles']['Row']['id'];
  email: Database['public']['Tables']['profiles']['Row']['email'];
  fullName: Database['public']['Tables']['profiles']['Row']['full_name'];
  jobTitle: Database['public']['Tables']['profiles']['Row']['job_title'];
  timezone: Database['public']['Tables']['profiles']['Row']['timezone'];
  organizationId: Database['public']['Tables']['profiles']['Row']['organization_id'];
  status: Database['public']['Tables']['profiles']['Row']['status'];
  roles: Array<Pick<Database['public']['Tables']['roles']['Row'], 'code' | 'name'>>;
  organization: Pick<
    Database['public']['Tables']['organizations']['Row'],
    'id' | 'name' | 'currency_code' | 'currency_symbol' | 'timezone'
  > | null;
};

/**
 * Obtiene el perfil del usuario actual junto con su rol y organización.
 * Devuelve null si no hay sesión activa.
 *
 * Envuelto en React.cache() para deduplicar llamadas dentro del mismo request
 * del servidor (layout + page llaman a esta función, el cache evita el segundo
 * roundtrip a Supabase).
 *
 * Cadena de dependencias (determina el orden de los grupos paralelos):
 *   Grupo A: auth.getUser()                         — sin dependencias
 *   Grupo B: profiles + user_roles en paralelo       — ambos solo necesitan user.id
 *   Grupo C: organizations + roles en paralelo       — organizations necesita organization_id
 *                                                      (de profiles), roles necesita roleIds
 *                                                      (de user_roles); entre sí son independientes
 */
export const getCurrentProfile = cache(async (): Promise<CurrentProfile | null> => {
  const supabase = await createSupabaseServerClient();

  // Grupo A
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  // Grupo B — profiles y user_roles solo necesitan user.id, no dependen entre sí
  const [profileResult, userRolesResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, email, full_name, job_title, timezone, organization_id, status')
      .eq('id', user.id)
      .single(),
    supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', user.id),
  ]);

  const { data: profile, error: profileError } = profileResult;
  const { data: userRoles } = userRolesResult;

  if (profileError || !profile) {
    return null;
  }

  const roleIds = userRoles?.map((ur) => ur.role_id) ?? [];

  // Grupo C — organizations depende de profiles (organization_id ya disponible),
  // roles depende de user_roles (roleIds ya disponible); entre sí son independientes
  const rolesQuery = roleIds.length > 0
    ? supabase.from('roles').select('code, name').in('id', roleIds)
    : Promise.resolve({ data: null as Array<{ code: string; name: string }> | null });

  const [organizationResult, rolesResult] = await Promise.all([
    supabase
      .from('organizations')
      .select('id, name, currency_code, currency_symbol, timezone')
      .eq('id', profile.organization_id)
      .single(),
    rolesQuery,
  ]);

  const { data: organization } = organizationResult;
  const roles: Array<{ code: string; name: string }> = rolesResult.data ?? [];

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    jobTitle: profile.job_title,
    timezone: profile.timezone,
    organizationId: profile.organization_id,
    status: profile.status,
    roles,
    organization: organization ?? null,
  };
});