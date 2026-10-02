import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

/**
 * Admin client using service_role key.
 * ONLY use in server-side contexts (Server Actions, API routes, etc.).
 * NEVER import this in client components.
 */
export const createSupabaseAdminClient = () => {
  // SUPABASE_SERVICE_ROLE_KEY is only available in server-side env
  const serviceRoleKey = (env as { SUPABASE_SERVICE_ROLE_KEY: string })
    .SUPABASE_SERVICE_ROLE_KEY;

  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};