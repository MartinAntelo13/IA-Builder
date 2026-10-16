import { ROUTES } from '@/constants';

export function requestDetailHref(id: string, opts?: { from?: string }): string {
  const base = `${ROUTES.REQUESTS}/${id}`;
  if (opts?.from) return `${base}?from=${encodeURIComponent(opts.from)}`;
  return base;
}
