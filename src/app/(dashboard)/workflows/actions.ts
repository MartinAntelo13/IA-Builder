'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ROUTES } from '@/constants';
import { buildWorkflowSchema, type WorkflowFormValues } from '@/lib/schemas/workflow.schema';
import { transformWorkflow, type WorkflowItem } from '@/lib/transformers/workflows';
import type { Database, Json } from '@/types/database.types';

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

export type SaveWorkflowResult =
  | { ok: true; workflow: WorkflowItem }
  | { ok: false; error: string };

// Mapeo de errores del RPC save_workflow:
//   42501 → permisos insuficientes
//   P0002 → workflow no encontrado
//   P0001 → validaciones de negocio (mensaje en español, mostrable tal cual)
function mapSaveWorkflowError(code: string | undefined, message: string): string {
  if (code === '42501') return 'No tenés permisos para editar workflows.';
  if (code === 'P0002') return 'El workflow no existe o fue eliminado.';
  return message || 'Error al guardar el workflow.';
}

export async function saveWorkflow(
  workflowId: string,
  input: WorkflowFormValues,
): Promise<SaveWorkflowResult> {
  if (!UUID_RE.test(workflowId)) return { ok: false, error: 'ID de workflow inválido' };

  const supabase = await createSupabaseServerClient();

  // EXCEPTION (Regla 10): no existe RPC de lectura de workflows. Leemos is_active
  // para elegir la variante del schema (un workflow activo requiere ≥1 paso).
  const { data: wfRow, error: wfError } = await supabase
    .from('workflows')
    .select('is_active')
    .eq('id', workflowId)
    .single();
  if (wfError || !wfRow) return { ok: false, error: 'Workflow no encontrado' };

  const parsed = buildWorkflowSchema(wfRow.is_active).safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  }

  // El RPC espera p_steps como jsonb: array ordenado de { id, label,
  // approver_type, role_id, user_id }. Mandamos null explícito en los campos
  // que no corresponden al tipo (nunca undefined).
  const stepsJson: Json = parsed.data.steps.map((s) => ({
    id: s.stepId,
    label: s.label,
    approver_type: s.approverType,
    role_id: s.approverType === 'role' ? (s.roleId || null) : null,
    user_id: s.approverType === 'user' ? (s.userId || null) : null,
  }));

  const args: Database['public']['Functions']['save_workflow']['Args'] = {
    p_workflow_id: workflowId,
    p_name: parsed.data.name,
    p_description: parsed.data.description,
    p_steps: stepsJson,
  };

  const { data, error } = await supabase.rpc('save_workflow', args);
  if (error) return { ok: false, error: mapSaveWorkflowError(error.code, error.message) };
  if (!data) return { ok: false, error: 'No se recibió respuesta del servidor' };

  revalidatePath(ROUTES.WORKFLOWS);

  const workflow = transformWorkflow({
    id: data.id,
    name: data.name,
    description: data.description,
    is_active: data.is_active,
    updated_at: data.updated_at,
    workflow_steps: [{ count: parsed.data.steps.length }],
  });

  return { ok: true, workflow };
}
