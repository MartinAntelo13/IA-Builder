import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { computeCriticalRoleNames, computeExtraDisableWarnings } from '@/lib/team/critical-roles';
import type { WorkflowStepRef } from '@/lib/team/critical-roles-message';

type MemberStatus = 'active' | 'invited' | 'disabled';
type Role = Pick<Database['public']['Tables']['roles']['Row'], 'id' | 'name'>;

// Carga de /team: resuelve las TRES consultas que alimentan los avisos de deshabilitar.
// - workflow_steps: todos los pasos de workflows activos. workflow_steps tiene UNA sola FK
//   a workflows, así que el embed workflows!inner no es ambiguo (no hace falta nombre).
//   Antes había un .not('role_id','is',null) para la query de roles; ahora traemos todos los
//   pasos y filtramos en memoria para construir también los mapas de 'user' y 'requester_manager'.
// - user_roles: asignaciones a profiles activos. FK explícita user_roles_user_id_organization_id_fkey
//   porque user_roles tiene dos FK a profiles (assigned_by y user_id); sin nombre el embed es
//   ambiguo en runtime.
// - profiles: cuenta de subordinados activos por responsable (manager_id not null).
// Limitación: PostgREST corta en 1000 filas por default (igual que la query de user_roles);
// queda como deuda si la organización supera eso.
// Lanza Error con el message original si falla cualquiera (mismo patrón que /team).
export async function loadCriticalRolesContext(
  supabase: SupabaseClient<Database>,
  roles: readonly Role[],
): Promise<{
  getCriticalRoleNamesFor: (userId: string, status: MemberStatus) => string[];
  getExtraDisableWarningsFor: (userId: string, status: MemberStatus) => string[];
}> {
  const [stepsResult, activeUserRolesResult, activeReportsResult] = await Promise.all([
    supabase
      .from('workflow_steps')
      .select('approver_type, role_id, user_id, label, workflows!inner(name, is_active)')
      .eq('workflows.is_active', true),
    supabase
      .from('user_roles')
      .select('user_id, role_id, profiles!user_roles_user_id_organization_id_fkey!inner(status)')
      .eq('profiles.status', 'active'),
    supabase
      .from('profiles')
      .select('manager_id')
      .eq('status', 'active')
      .not('manager_id', 'is', null),
  ]);
  if (stepsResult.error) throw new Error(stepsResult.error.message);
  if (activeUserRolesResult.error) throw new Error(activeUserRolesResult.error.message);
  if (activeReportsResult.error) throw new Error(activeReportsResult.error.message);

  const workflowRoleIds = new Set<string>();
  const assignedStepsByUser = new Map<string, WorkflowStepRef[]>();
  const managerSteps: WorkflowStepRef[] = [];
  for (const step of stepsResult.data ?? []) {
    if (step.role_id) workflowRoleIds.add(step.role_id);
    const ref: WorkflowStepRef = {
      workflowName: step.workflows?.name ?? '',
      stepLabel: step.label ?? '',
    };
    if (step.approver_type === 'user' && step.user_id) {
      const arr = assignedStepsByUser.get(step.user_id) ?? [];
      arr.push(ref);
      assignedStepsByUser.set(step.user_id, arr);
    } else if (step.approver_type === 'requester_manager') {
      managerSteps.push(ref);
    }
  }

  const activeUsersByRole = new Map<string, string[]>();
  const rolesByActiveUser = new Map<string, string[]>();
  for (const row of activeUserRolesResult.data ?? []) {
    const perRole = activeUsersByRole.get(row.role_id) ?? [];
    perRole.push(row.user_id);
    activeUsersByRole.set(row.role_id, perRole);
    const perUser = rolesByActiveUser.get(row.user_id) ?? [];
    perUser.push(row.role_id);
    rolesByActiveUser.set(row.user_id, perUser);
  }
  const rolesById = new Map<string, string>(roles.map((r) => [r.id, r.name]));

  const reportsByManager = new Map<string, number>();
  for (const row of activeReportsResult.data ?? []) {
    if (row.manager_id) {
      reportsByManager.set(row.manager_id, (reportsByManager.get(row.manager_id) ?? 0) + 1);
    }
  }

  return {
    getCriticalRoleNamesFor: (userId, status) =>
      computeCriticalRoleNames(
        userId,
        status,
        rolesByActiveUser.get(userId) ?? [],
        workflowRoleIds,
        activeUsersByRole,
        rolesById,
      ),
    getExtraDisableWarningsFor: (userId, status) =>
      computeExtraDisableWarnings(
        status,
        assignedStepsByUser.get(userId) ?? [],
        reportsByManager.get(userId) ?? 0,
        managerSteps,
      ),
  };
}
