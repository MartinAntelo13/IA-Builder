import { ROUTES } from '@/constants';

export function requestDetailHref(id: string, opts?: { from?: 'inbox' }): string {
  const base = `${ROUTES.REQUESTS}/${id}`;
  if (opts?.from) return `${base}?from=${encodeURIComponent(opts.from)}`;
  return base;
}

export function requestAttachmentHref(requestId: string, attachmentId: string): string {
  return `${ROUTES.REQUESTS}/${requestId}/attachments/${attachmentId}`;
}
