'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ROUTES } from '@/constants';
import type { ActionResult } from '@/types/action-result';
import { UUID_RE } from '@/lib/validators/uuid';
import { toUserError } from '@/lib/errors/to-user-error';

export async function duplicateRequest(
  requestId: string,
): Promise<ActionResult<{ requestId: string }>> {
  if (!UUID_RE.test(requestId)) {
    return { ok: false, error: 'ID de solicitud inválido.' };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('duplicate_request', {
    p_request_id: requestId,
  });

  if (error) {
    return { ok: false, error: toUserError(error, { label: 'duplicateRequest', fallback: 'No se pudo duplicar la solicitud.', forbidden: 'No tenés permisos para duplicar esta solicitud.', notFound: 'La solicitud no existe.' }) };
  }
  if (!data?.id) {
    return { ok: false, error: 'No se pudo duplicar la solicitud.' };
  }

  revalidatePath(ROUTES.REQUESTS);
  revalidatePath(ROUTES.HOME);
  return { ok: true, requestId: data.id };
}
