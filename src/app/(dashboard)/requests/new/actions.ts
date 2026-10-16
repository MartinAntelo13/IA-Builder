'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient, getCurrentProfile } from '@/lib/supabase/server';
import { ROUTES } from '@/constants';
import { requestDetailHref } from '@/lib/routes';
import { uploadAttachmentFile } from '@/lib/storage/request-attachments';
import type { Database } from '@/types/database.types';

type PriorityLevel = Database['public']['Enums']['priority_level'];

// Only columns permitted by grant insert (...) on public.requests to authenticated
type RequestInsertPayload = Pick<
  Database['public']['Tables']['requests']['Insert'],
  'request_type_id' | 'title' | 'description' | 'amount' | 'cost_center_id' | 'priority' | 'required_date'
>;

export interface RequestActionResult {
  error?: string;
  requestId?: string;
}

async function insertRequest(
  formData: FormData,
  _status: 'draft' | 'submitted',
): Promise<RequestActionResult> {
  const profile = await getCurrentProfile();
  if (!profile?.organization) return { error: 'No autorizado' };

  const supabase = await createSupabaseServerClient();

  const request_type_id = formData.get('request_type_id') as string;
  const title = formData.get('title') as string;
  const description = ((formData.get('description') as string | null) ?? '').trim();
  const cost_center_id = (formData.get('cost_center_id') as string) || null;
  const priority = formData.get('priority') as PriorityLevel;
  const amountRaw = formData.get('amount') as string | null;
  const amount = amountRaw ? parseFloat(amountRaw) : null;

  // Trigger requests_before_insert (security definer) populates: organization_id, requester_id,
  // status, request_seq, currency_code, submitted_at — pass only permitted columns to client
  const insertPayload: RequestInsertPayload = {
    request_type_id,
    title,
    description: description || null,
    amount: amount ?? null,
    cost_center_id,
    priority,
    required_date: null,
  };

  const { data: request, error: insertError } = await supabase
    .from('requests')
    .insert(insertPayload)
    .select('id')
    .single();

  if (insertError || !request) {
    return { error: insertError?.message ?? 'Error al crear la solicitud' };
  }

  const files = formData.getAll('attachments') as File[];
  const failedFiles: string[] = [];

  // Reutiliza el helper compartido con addAttachment: sube al bucket + inserta
  // la fila con el payload tipado + rollback de Storage si falla el insert.
  for (const file of files) {
    const result = await uploadAttachmentFile(supabase, profile.organizationId, request.id, file);
    if (!result.ok) failedFiles.push(file.name);
  }

  if (failedFiles.length > 0) {
    return {
      requestId: request.id,
      error: `La solicitud se guardó como borrador, pero no se pudieron adjuntar los siguientes archivos: ${failedFiles.join(', ')}. Podés reintentar la carga desde el detalle de la solicitud.`,
    };
  }

  return { requestId: request.id };
}

export async function createRequest(
  formData: FormData,
): Promise<RequestActionResult> {
  const result = await insertRequest(formData, 'draft');
  if (result.error) return result;
  redirect(requestDetailHref(result.requestId!));
}

export async function submitRequest(
  formData: FormData,
): Promise<RequestActionResult> {
  const result = await insertRequest(formData, 'draft');
  if (result.error) return result;

  const supabase = await createSupabaseServerClient();
  const { error: submitError } = await supabase.rpc('submit_request', {
    p_request_id: result.requestId!,
  });

  if (submitError) {
    return {
      error: `La solicitud quedó guardada como borrador, pero el envío falló: ${submitError.message}`,
      requestId: result.requestId,
    };
  }

  redirect(ROUTES.REQUESTS);
}
