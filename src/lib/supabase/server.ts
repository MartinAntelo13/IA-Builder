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
  organizationId: Database['public']['Tables']['profiles']['Row']['organization_id'];
  status: Database['public']['Tables']['profiles']['Row']['status'];
  roles: Array<Pick<Database['public']['Tables']['roles']['Row'], 'code' | 'name'>>;
  organization: Pick<
    Database['public']['Tables']['organizations']['Row'],
    'id' | 'name' | 'currency_code' | 'currency_symbol'
  > | null;
};

/**
 * Obtiene el perfil del usuario actual junto con su rol y organización.
 * Devuelve null si no hay sesión activa.
 */
export const getCurrentProfile = async (): Promise<CurrentProfile | null> => {
  const supabase = await createSupabaseServerClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  // Obtener perfil
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name, job_title, organization_id, status')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return null;
  }

  // Obtener roles del usuario
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role_id')
    .eq('user_id', user.id);

  const roleIds = userRoles?.map((ur) => ur.role_id) ?? [];

  // Obtener roles
  const roles: Array<{ code: string; name: string }> = roleIds.length > 0
    ? (await supabase
        .from('roles')
        .select('code, name')
        .in('id', roleIds)).data ?? []
    : [];

  // Obtener organización
  const { data: organization } = await supabase
    .from('organizations')
    .select('id, name, currency_code, currency_symbol')
    .eq('id', profile.organization_id)
    .single();

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    jobTitle: profile.job_title,
    organizationId: profile.organization_id,
    status: profile.status,
    roles,
    organization: organization ?? null,
  };
};