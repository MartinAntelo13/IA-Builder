import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { RequestDetailData } from '@/types/request-detail';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; attachmentId: string }> },
) {
  const { id, attachmentId } = await params;

  if (!UUID_RE.test(id) || !UUID_RE.test(attachmentId)) {
    return new Response('Bad Request', { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  // Regla 10: obtener adjunto vía RPC (RLS verifica acceso del usuario a la solicitud)
  const { data, error } = await supabase.rpc('get_request_detail', { p_request_id: id });
  if (error || !data) return new Response('Not Found', { status: 404 });

  const detail = data as RequestDetailData;
  const attachment = detail.attachments.find((a) => a.id === attachmentId);
  if (!attachment) return new Response('Not Found', { status: 404 });

  const { data: urlData, error: urlError } = await supabase.storage
    .from('request-attachments')
    .createSignedUrl(attachment.storage_path, 60, { download: attachment.file_name });

  if (urlError || !urlData?.signedUrl) {
    return new Response('Error al generar el enlace de descarga', { status: 500 });
  }

  return NextResponse.redirect(urlData.signedUrl);
}
