'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ROUTES } from '@/constants';
import type { Database } from '@/types/database.types';
import type { ActionResult } from '@/types/action-result';
import { parseRequestFormData } from '@/lib/requests/parse-request-form';
import { requestDetailHref } from '@/lib/routes';
import { toUserError } from '@/lib/errors/to-user-error';

function revalidateRequest(requestId: string) {
  revalidatePath(requestDetailHref(requestId));
  revalidatePath(ROUTES.REQUESTS);
  revalidatePath(ROUTES.INBOX);
  revalidatePath('/');
}

export async function approveRequest(requestId: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('decide_request', {
    p_request_id: requestId,
    p_decision: 'approved',
  });
  if (error) return { ok: false, error: toUserError(error, { label: 'approveRequest', fallback: 'No se pudo aprobar la solicitud.', forbidden: 'No tenés permisos para decidir esta solicitud.', notFound: 'La solicitud no existe.' }) };
  revalidateRequest(requestId);
  return { ok: true };
}

export async function requestChanges(requestId: string, comment: string): Promise<ActionResult> {
  const trimmed = comment.trim();
  if (!trimmed) return { ok: false, error: 'Se requiere un comentario para esta decisión' };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('decide_request', {
    p_request_id: requestId,
    p_decision: 'changes_requested',
    p_comment: trimmed,
  });
  if (error) return { ok: false, error: toUserError(error, { label: 'requestChanges', fallback: 'No se pudo solicitar los cambios.', forbidden: 'No tenés permisos para decidir esta solicitud.', notFound: 'La solicitud no existe.' }) };
  revalidateRequest(requestId);
  return { ok: true };
}

export async function rejectRequest(requestId: string, comment: string): Promise<ActionResult> {
  const trimmed = comment.trim();
  if (!trimmed) return { ok: false, error: 'Se requiere un comentario para esta decisión' };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('decide_request', {
    p_request_id: requestId,
    p_decision: 'rejected',
    p_comment: trimmed,
  });
  if (error) return { ok: false, error: toUserError(error, { label: 'rejectRequest', fallback: 'No se pudo rechazar la solicitud.', forbidden: 'No tenés permisos para decidir esta solicitud.', notFound: 'La solicitud no existe.' }) };
  revalidateRequest(requestId);
  return { ok: true };
}

export async function resubmitRequest(requestId: string, comment?: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('resubmit_request', {
    p_request_id: requestId,
    ...(comment?.trim() ? { p_comment: comment.trim() } : {}),
  });
  if (error) return { ok: false, error: toUserError(error, { label: 'resubmitRequest', fallback: 'No se pudo reenviar la solicitud.', forbidden: 'No tenés permisos para reenviar esta solicitud.' }) };
  revalidateRequest(requestId);
  return { ok: true };
}

export async function cancelRequest(requestId: string, reason?: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('cancel_request', {
    p_request_id: requestId,
    ...(reason?.trim() ? { p_reason: reason.trim() } : {}),
  });
  if (error) return { ok: false, error: toUserError(error, { label: 'cancelRequest', fallback: 'No se pudo cancelar la solicitud.', forbidden: 'No tenés permisos para cancelar esta solicitud.' }) };
  revalidateRequest(requestId);
  return { ok: true };
}

// EXCEPTION (Regla 10): no existe RPC update_request. Supabase expone grants
// por columna sobre public.requests y el trigger requests_guard_update aplica
// reglas de mutación (bloquea request_type_id si status != 'draft', valida
// transiciones de estado). La policy requests_update exige estado en
// ('draft','changes_requested'). Si la policy filtra la fila, UPDATE afecta 0
// filas SIN devolver error: por eso .select('id') y data.length === 0 → error.
export async function updateRequest(
  requestId: string,
  formData: FormData,
): Promise<ActionResult> {
  if (!/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(requestId))
    return { ok: false, error: 'ID de solicitud inválido' };

  const parsed = parseRequestFormData(formData);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const supabase = await createSupabaseServerClient();

  // required_date no se incluye: no hay UI que lo edite y un UPDATE sin la clave
  // conserva el valor actual. Un payload con `required_date: null` lo pisaría.
  type UpdatePayload = Pick<
    Database['public']['Tables']['requests']['Update'],
    'request_type_id' | 'title' | 'description' | 'amount' | 'cost_center_id' | 'priority' | 'required_date'
  >;
  const payload: UpdatePayload = {
    request_type_id: parsed.data.request_type_id,
    title: parsed.data.title,
    description: parsed.data.description?.trim() || null,
    amount: parsed.data.amount ?? null,
    cost_center_id: parsed.data.cost_center_id ?? null,
    priority: parsed.data.priority,
  };

  const { data, error } = await supabase
    .from('requests')
    .update(payload)
    .eq('id', requestId)
    .select('id');

  if (error) return { ok: false, error: toUserError(error, { label: 'updateRequest', fallback: 'No se pudo guardar los cambios.', forbidden: 'No tenés permisos para editar esta solicitud.' }) };
  if (!data || data.length === 0) {
    return { ok: false, error: 'La solicitud ya no se puede editar' };
  }

  revalidateRequest(requestId);
  return { ok: true };
}

export async function submitDraft(requestId: string): Promise<ActionResult> {
  if (!/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(requestId))
    return { ok: false, error: 'ID de solicitud inválido' };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('submit_request', { p_request_id: requestId });
  if (error) return { ok: false, error: toUserError(error, { label: 'submitDraft', fallback: 'No se pudo enviar la solicitud.', forbidden: 'No tenés permisos para enviar esta solicitud.' }) };
  revalidateRequest(requestId);
  return { ok: true };
}

// EXCEPTION (Regla 10): insert directo — no existe RPC create_comment.
// grant insert (request_id, body) on public.comments; author_id y organization_id
// los completa el trigger comments_before_insert. Igual que el borrador en Fase 3.
export async function addComment(requestId: string, body: string): Promise<ActionResult> {
  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: 'El comentario no puede estar vacío' };
  if (trimmed.length > 5000) return { ok: false, error: 'El comentario no puede superar los 5000 caracteres' };
  const supabase = await createSupabaseServerClient();
  const payload: Pick<Database['public']['Tables']['comments']['Insert'], 'request_id' | 'body'> = {
    request_id: requestId,
    body: trimmed,
  };
  const { error } = await supabase.from('comments').insert(payload);
  if (error) return { ok: false, error: toUserError(error, { label: 'addComment', fallback: 'No se pudo agregar el comentario.', forbidden: 'No tenés permisos para comentar en esta solicitud.' }) };
  revalidateRequest(requestId);
  return { ok: true };
}
