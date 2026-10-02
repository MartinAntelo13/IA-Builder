// 'use client' - hook uses useEffect and useState to fetch and sync user profile
// from Supabase auth and database
'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

/**
 * Columnas reales de `profiles` que este hook consulta (Regla 7: derivadas del
 * tipo generado por Supabase, no duplicadas a mano).
 *
 * MISMATCH señalado (no forzado): el schema real marca `email` y `full_name`
 * como NOT NULL (`string`, sin `| null`), pero el código de este hook hace
 * `profileData.email ?? null` de forma defensiva. Se deja esa defensividad
 * intacta (no es parte de esta tarea tocar lógica), solo se documenta que,
 * según el tipo generado, esos fallbacks a `null` son código muerto en teoría.
 */
type ProfileRow = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'email' | 'full_name' | 'job_title'
>;

/**
 * EXCEPTION (Regla 7): `awaiting_my_review` NO es una columna de `profiles`.
 * Es un campo calculado que este hook deja hardcodeado en `0` en ambos branches
 * de abajo y que, a la fecha, ningún consumidor lee desde `useCurrentUser()`
 * (topbar.tsx obtiene su propio `awaiting_my_review` directamente desde el RPC
 * get_dashboard_kpis, no desde este hook). Se mantiene en el tipo para no alterar
 * el shape público del hook — cambiar/eliminar ese campo es una decisión de
 * lógica de negocio fuera de alcance de esta tarea, que es solo de tipado.
 */
interface UserProfile {
  id: ProfileRow['id'];
  email: ProfileRow['email'];
  fullName: ProfileRow['full_name'];
  jobTitle: ProfileRow['job_title'];
  awaiting_my_review: number;
}

/**
 * Hook para obtener el usuario actual en componentes Client.
 * Usa el browser client de @supabase/ssr para mantener
 * la sesión sincronizada con el servidor.
 */
export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);

      if (data.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, email, full_name, job_title')
          .eq('id', data.user.id)
          .single();

        if (profileData) {
          setProfile({
            id: profileData.id,
            email: profileData.email ?? null,
            fullName: profileData.full_name,
            jobTitle: profileData.job_title,
            awaiting_my_review: 0,
          });
        }
      }
      setLoading(false);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        setProfile(null);

        if (session?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, email, full_name, job_title')
            .eq('id', session.user.id)
            .single();

          if (profileData) {
            setProfile({
              id: profileData.id,
              email: profileData.email ?? null,
              fullName: profileData.full_name,
              jobTitle: profileData.job_title,
              awaiting_my_review: 0,
            });
          }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { user, profile, loading };
}