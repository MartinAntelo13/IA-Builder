'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ROUTES } from '@/constants';
import type { Database } from '@/types/database.types';

export type ActionResult = { ok: true } | { ok: false; error: string };

const UUID_RE = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;

// EXCEPTION (Regla 10): no existe RPC de activación de workflow.
// grant update (tabla completa) en workflows; la policy exige workflow.manage.
// El trigger touch_workflow actualiza updated_at en cambios de workflow_steps, no aquí.
export async function setWorkflowActive(
  workflowId: string,
  isActive: boolean,
): Promise<ActionResult> {
  if (!UUID_RE.test(workflowId)) return { ok: false, error: 'ID de workflow inválido' };
  const supabase = await createSupabaseServerClient();
  const payload: Pick<Database['public']['Tables']['workflows']['Update'], 'is_active'> = {
    is_active: isActive,
  };
  const { error } = await supabase.from('workflows').update(payload).eq('id', workflowId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(ROUTES.WORKFLOWS);
  return { ok: true };
}

export async function duplicateWorkflow(
  workflowId: string,
): Promise<{ ok: true; workflowId: string } | { ok: false; error: string }> {
  if (!UUID_RE.test(workflowId)) return { ok: false, error: 'ID de workflow inválido' };
  const supabase = await createSupabaseServerClient();

  // EXCEPTION (Regla 10): no existe RPC de lectura de workflows.
  // Leemos el nombre del origen para armar el nombre de la copia.
  const { data: src, error: srcError } = await supabase
    .from('workflows')
    .select('name')
    .eq('id', workflowId)
    .single();
  if (srcError || !src) return { ok: false, error: srcError?.message ?? 'Workflow no encontrado' };

  const { data, error } = await supabase.rpc('duplicate_workflow', {
    p_workflow_id: workflowId,
    p_name: `${src.name} (copia)`,
  });
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: 'No se recibió respuesta del servidor' };
  revalidatePath(ROUTES.WORKFLOWS);
  return { ok: true, workflowId: data.id };
}
