import { cache } from 'react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';

type DashboardKpis = Database['public']['Functions']['get_dashboard_kpis']['Returns'][number];

// cache() de React: comparte el resultado entre layout y page para que
// get_dashboard_kpis corra UNA sola vez por request. Devuelve el { data, error }
// del cliente de Supabase; cada consumidor decide cómo manejar el error.
export const getDashboardKpis = cache(async () => {
  const supabase = await createSupabaseServerClient();
  return supabase
    .rpc('get_dashboard_kpis')
    .single<DashboardKpis>();
});
