import 'server-only';

import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import type { Database } from '@/types/database.types';

/**
 * Admin client using service_role key.
 * ONLY use in server-side contexts (Server Actions, API routes, etc.).
 * `import 'server-only'` arriba hace fallar el build si se importa desde un
 * componente cliente, para que SUPABASE_SERVICE_ROLE_KEY nunca llegue al bundle.
 */
export const createSupabaseAdminClient = () => {
  // SUPABASE_SERVICE_ROLE_KEY solo está disponible server-side; el tipo de env
  // es la unión ServerEnv | ClientEnv y hay que estrechar manualmente.
  const serviceRoleKey = (env as { SUPABASE_SERVICE_ROLE_KEY: string })
    .SUPABASE_SERVICE_ROLE_KEY;

  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
