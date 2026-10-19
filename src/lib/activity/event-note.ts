import type { RequestEventType } from '@/types';

// Extrae la nota libre que corresponde a un evento del historial:
//   - 'resubmitted': metadata.comment (la nota que escribió el solicitante al reenviar)
//   - 'cancelled': metadata.reason (el motivo que escribió el solicitante al cancelar)
// Cualquier otro event_type devuelve null (no reusamos texto que ya se muestra
// en las cajas de "Cambios solicitados" / "Rechazada" del panel de acciones).
// Es pura: no toca Date.now ni ningún estado — segura para Server Components.
export function getEventNote(
  eventType: RequestEventType,
  metadata: Record<string, unknown> | null,
): string | null {
  if (!metadata) return null;
  const key =
    eventType === 'resubmitted' ? 'comment' :
    eventType === 'cancelled' ? 'reason' :
    null;
  if (key === null) return null;
  const raw = metadata[key];
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}
