'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ROUTES } from '@/constants';
import type { ActionResult } from '@/types/action-result';
import { UUID_RE } from '@/lib/validators/uuid';

// La RPC duplicate_request valida permiso request.create, ownership
// (requester_id = auth.uid()) y que el tipo esté activo. Devuelve estos
// códigos de error en español:
//   42501 — permisos insuficientes o no sos el solicitante
//   P0002 — solicitud no encontrada
//   P0001 — tipo de solicitud inactivo
// Para cualquier otro código devolvemos un mensaje genérico sin filtrar el
// texto crudo de Postgres.
const PASS_THROUGH_CODES = new Set(['42501', 'P0002', 'P0001']);

export async function duplicateRequest(
  requestId: string,
): Promise<ActionResult<{ requestId: string }>> {
  if (!UUID_RE.test(requestId)) {
    return { ok: false, error: 'ID de solicitud inválido' };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('duplicate_request', {
    p_request_id: requestId,
  });

  if (error) {
    const message = PASS_THROUGH_CODES.has(error.code ?? '')
      ? error.message
      : 'No se pudo duplicar la solicitud';
    return { ok: false, error: message };
  }
  if (!data?.id) {
    return { ok: false, error: 'No se pudo duplicar la solicitud' };
  }

  revalidatePath(ROUTES.REQUESTS);
  revalidatePath(ROUTES.HOME);
  return { ok: true, requestId: data.id };
}
