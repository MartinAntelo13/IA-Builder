import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { requestDetailSchema, type RequestDetailData } from '@/lib/schemas/request-detail.schema';

export async function getRequestDetail(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<RequestDetailData | null> {
  const { data, error } = await supabase.rpc('get_request_detail', { p_request_id: id });
  if (error || !data) return null;
  const parsed = requestDetailSchema.safeParse(data);
  if (!parsed.success) {
    console.error('get_request_detail: respuesta con contrato inválido', {
      requestId: id,
      issues: parsed.error.issues,
    });
    throw new Error('Respuesta inválida de get_request_detail');
  }
  return parsed.data;
}
