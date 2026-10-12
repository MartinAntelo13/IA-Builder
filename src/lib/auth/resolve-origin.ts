import { headers } from 'next/headers';
import { env } from '@/lib/env';

// Origen para el redirectTo: preferimos headers() del request real (expone el
// dominio donde está corriendo la app); fallback a X-Forwarded y luego a env.
// Normalizamos la barra final para que redirectTo = origin + ROUTES.AUTH_CONFIRM
// no termine con "//auth/confirm".
export async function resolveOrigin(): Promise<string> {
  const h = await headers();
  const origin = h.get('origin');
  if (origin) return origin.replace(/\/+$/, '');
  const proto = h.get('x-forwarded-proto') ?? 'https';
  const host = h.get('x-forwarded-host') ?? h.get('host');
  if (host) return `${proto}://${host}`;
  return env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '');
}
