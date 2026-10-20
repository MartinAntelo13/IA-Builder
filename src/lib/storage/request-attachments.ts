import type { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';
import { toUserError } from '@/lib/errors/to-user-error';

// Mismo tipo inferido que el resto del proyecto: createServerClient sin generic
// devuelve un cliente con tipado laxo que permite Pick<..., ...> en los inserts.
type ServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

type AttachmentInsertPayload = Pick<
  Database['public']['Tables']['attachments']['Insert'],
  'request_id' | 'file_name' | 'mime_type' | 'size_bytes' | 'storage_path' | 'checksum'
>;

export type UploadAttachmentResult = { ok: true } | { ok: false; error: string };

/**
 * Sube un archivo al bucket 'request-attachments' y crea la fila en public.attachments.
 * Si el insert falla, borra el objeto subido para no dejar huérfanos en Storage.
 * Ruta: {organization_id}/{request_id}/{uuid}-{nombre saneado}.
 * Las policies "upload" y "attachments_insert" exigen org match + owns_editable_request,
 * cumplido por un borrador propio o una solicitud propia en changes_requested.
 */
export async function uploadAttachmentFile(
  supabase: ServerClient,
  organizationId: string,
  requestId: string,
  file: File,
): Promise<UploadAttachmentResult> {
  const safeName = file.name.replace(/[^A-Za-z0-9._-]/g, '_');
  const storagePath = `${organizationId}/${requestId}/${crypto.randomUUID()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from('request-attachments')
    .upload(storagePath, file);
  if (uploadError) return { ok: false, error: toUserError({ message: uploadError.message }, { label: 'uploadAttachment.storage', fallback: 'No se pudo subir el archivo.' }) };

  // Trigger attachments_before_insert (security definer) completa organization_id
  // y uploaded_by — pasamos solo las columnas permitidas por el grant insert.
  const payload: AttachmentInsertPayload = {
    request_id: requestId,
    file_name: file.name,
    mime_type: file.type,
    size_bytes: file.size,
    storage_path: storagePath,
    checksum: null,
  };
  const { error: insertError } = await supabase.from('attachments').insert(payload);
  if (insertError) {
    await supabase.storage.from('request-attachments').remove([storagePath]);
    return { ok: false, error: toUserError(insertError, { label: 'uploadAttachment.insert', fallback: 'No se pudo registrar el adjunto.' }) };
  }

  return { ok: true };
}
