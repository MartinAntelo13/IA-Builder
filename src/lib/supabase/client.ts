import { createBrowserClient } from '@supabase/ssr';
import { env } from '@/lib/env';
import type { AppDatabase } from '@/types/database-app';

export const supabase = createBrowserClient<AppDatabase>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);