'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ROUTES } from '@/constants';
import type { Database } from '@/types/database.types';

export type ActionResult = { ok: true } | { ok: false; error: string };

function revalidateRequest(requestId: string) {
  revalidatePath(`${ROUTES.REQUESTS}/${requestId}`);
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
  if (error) return { ok: false, error: error.message };
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
  if (error) return { ok: false, error: error.message };
  revalidateRequest(requestId);
  return { ok: true };
}

export async function resubmitRequest(requestId: string, comment?: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('resubmit_request', {
    p_request_id: requestId,
    ...(comment?.trim() ? { p_comment: comment.trim() } : {}),
  });
  if (error) return { ok: false, error: error.message };
  revalidateRequest(requestId);
  return { ok: true };
}

export async function cancelRequest(requestId: string, reason?: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('cancel_request', {
    p_request_id: requestId,
    ...(reason?.trim() ? { p_reason: reason.trim() } : {}),
  });
  if (error) return { ok: false, error: error.message };
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
  if (error) return { ok: false, error: error.message };
  revalidateRequest(requestId);
  return { ok: true };
}
