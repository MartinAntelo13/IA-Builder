/**
 * Definiciones de tipos e interfaces globales de TypeScript.
 */

export type PageProps<TParams = Record<string, string | string[]>> = {
  params: Promise<TParams>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
