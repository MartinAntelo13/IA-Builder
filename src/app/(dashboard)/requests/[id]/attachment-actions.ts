'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient, getCurrentProfile } from '@/lib/supabase/server';
import { uploadAttachmentFile } from '@/lib/storage/request-attachments';
import { requestDetailHref } from '@/lib/routes';
import { validateAttachmentFile } from '@/lib/validations/attachment-file';
import type { ActionResult } from '@/types/action-result';
import { UUID_RE } from '@/lib/validators/uuid';
import { toUserError } from '@/lib/errors/to-user-error';

export async function addAttachment(
  requestId: string,
  formData: FormData,
): Promise<ActionResult> {
  if (!UUID_RE.test(requestId)) return { ok: false, error: 'ID de solicitud inválido.' };

  const file = formData.get('file');
  if (!(file instanceof File)) return { ok: false, error: 'Archivo inválido.' };

  // La action nunca confía en el cliente: revalida tamaño y MIME con la misma
  // función que usa el formulario (coincide con el bucket).
  const validation = validateAttachmentFile(file);
  if (!validation.ok) return { ok: false, error: validation.error };

  const profile = await getCurrentProfile();
  if (!profile?.organization) return { ok: false, error: 'No autorizado.' };

  const supabase = await createSupabaseServerClient();
  const result = await uploadAttachmentFile(supabase, profile.organizationId, requestId, file);
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath(requestDetailHref(requestId));
  return { ok: true };
}

export async function removeAttachment(
  requestId: string,
  attachmentId: string,
): Promise<ActionResult> {
  if (!UUID_RE.test(requestId)) return { ok: false, error: 'ID de solicitud inválido.' };
  if (!UUID_RE.test(attachmentId)) return { ok: false, error: 'ID de adjunto inválido.' };

  const supabase = await createSupabaseServerClient();

  // 1) Borrar la fila primero. RLS exige uploaded_by = auth.uid() y
  // owns_editable_request; si no se cumple, 0 filas SIN devolver error.
  // Capturamos storage_path para después remover el objeto.
  const { data, error } = await supabase
    .from('attachments')
    .delete()
    .eq('id', attachmentId)
    .select('storage_path');

  if (error) return { ok: false, error: toUserError(error, { label: 'removeAttachment', fallback: 'No se pudo quitar el adjunto.' }) };
  if (!data || data.length === 0) {
    return { ok: false, error: 'No se puede quitar este adjunto.' };
  }

  // 2) Remover el objeto de Storage de forma tolerante: la fila ya no existe
  // y la policy "request attachments: delete own" valida owns_editable_request.
  // Si falla, logueamos el motivo y seguimos (no revertimos).
  const storagePath = data[0].storage_path;
  const { error: storageError } = await supabase.storage
    .from('request-attachments')
    .remove([storagePath]);
  if (storageError) {
    console.error(storageError.message);
  }

  revalidatePath(requestDetailHref(requestId));
  return { ok: true };
}
