import type { createSupabaseServerClient } from '@/lib/supabase/server';
import { transformWorkflowStep } from '@/lib/transformers/workflows';
import type { WorkflowStepFromQuery } from '@/lib/transformers/workflows';

type ServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;
type WorkflowStep = ReturnType<typeof transformWorkflowStep>;
type RequestTypeRef = { id: string; name: string; workflow_id: string | null };

export interface WorkflowDetailsResult {
  steps: WorkflowStep[];
  usedByTypes: { id: string; name: string }[];
}

// EXCEPTION (Regla 10): no existe RPC de lectura de workflows.
export async function loadWorkflowDetails(
  supabase: ServerClient,
  workflowId: string,
  requestTypes: RequestTypeRef[],
): Promise<WorkflowDetailsResult> {
  const stepsResult = await supabase
    .from('workflow_steps')
    .select('id, position, label, approver_type, role_id, user_id, sla_hours')
    .eq('workflow_id', workflowId)
    .order('position');

  if (stepsResult.error) throw new Error(stepsResult.error.message);

  const rawSteps = (stepsResult.data ?? []) as WorkflowStepFromQuery[];
  const roleIds = [...new Set(rawSteps.flatMap((s) => (s.role_id ? [s.role_id] : [])))];
  const userIds = [...new Set(rawSteps.flatMap((s) => (s.user_id ? [s.user_id] : [])))];

  const [rolesResult, usersResult] = await Promise.all([
    roleIds.length > 0
      ? supabase.from('roles').select('id, name').in('id', roleIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[], error: null }),
    userIds.length > 0
      ? supabase.from('profiles').select('id, full_name').in('id', userIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string }[], error: null }),
  ]);

  if (rolesResult.error) throw new Error(rolesResult.error.message);
  if (usersResult.error) throw new Error(usersResult.error.message);

  const roleNames = Object.fromEntries((rolesResult.data ?? []).map((r) => [r.id, r.name]));
  const userNames = Object.fromEntries((usersResult.data ?? []).map((u) => [u.id, u.full_name]));

  return {
    steps: rawSteps.map((s) => transformWorkflowStep(s, roleNames, userNames)),
    usedByTypes: requestTypes
      .filter((rt) => rt.workflow_id === workflowId)
      .map((rt) => ({ id: rt.id, name: rt.name })),
  };
}
