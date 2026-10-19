/**
 * Definiciones de tipos e interfaces globales de TypeScript.
 */
import type { Database } from '@/types/database.types';

export type RequestEventType = Database['public']['Enums']['event_type'];

export type PageProps<TParams = Record<string, string | string[]>> = {
  params: Promise<TParams>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
