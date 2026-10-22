import { ROUTES } from '@/constants';

export function requestDetailHref(id: string, opts?: { from?: 'inbox' }): string {
  const base = `${ROUTES.REQUESTS}/${id}`;
  if (opts?.from) return `${base}?from=${encodeURIComponent(opts.from)}`;
  return base;
}

export function requestAttachmentHref(requestId: string, attachmentId: string): string {
  return `${ROUTES.REQUESTS}/${requestId}/attachments/${attachmentId}`;
}

export function requestsListHref(opts?: { scope?: 'all'; q?: string; page?: number }): string {
  const params = new URLSearchParams();
  if (opts?.scope === 'all') params.set('scope', 'all');
  if (opts?.q) params.set('q', opts.q);
  if (opts?.page && opts.page > 1) params.set('page', String(opts.page));
  const qs = params.toString();
  return qs ? `${ROUTES.REQUESTS}?${qs}` : ROUTES.REQUESTS;
}
