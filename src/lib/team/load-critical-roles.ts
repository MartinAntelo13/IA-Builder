import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { computeCriticalRoleNames } from '@/lib/team/critical-roles';

type MemberStatus = 'active' | 'invited' | 'disabled';
type Role = Pick<Database['public']['Tables']['roles']['Row'], 'id' | 'name'>;

// Carga de /team: resuelve las dos consultas que alimentan la advertencia de
// deshabilitar (D). workflows!inner(is_active)=true limita a steps cuyo workflow
// está activo; profiles!user_roles_user_id_organization_id_fkey!inner(status)='active'
// limita a user_roles con profile activo (FK explícita: user_roles tiene dos FK hacia
// profiles —assigned_by y user_id— y sin nombre el embed es ambiguo en runtime).
// Lanza Error con el message original si falla cualquiera (mismo patrón que /team).
export async function loadCriticalRolesContext(
  supabase: SupabaseClient<Database>,
  roles: readonly Role[],
): Promise<{ getCriticalRoleNamesFor: (userId: string, status: MemberStatus) => string[] }> {
  const [workflowRoleStepsResult, activeUserRolesResult] = await Promise.all([
    supabase
      .from('workflow_steps')
      .select('role_id, workflows!inner(is_active)')
      .not('role_id', 'is', null)
      .eq('workflows.is_active', true),
    supabase
      .from('user_roles')
      .select('user_id, role_id, profiles!user_roles_user_id_organization_id_fkey!inner(status)')
      .eq('profiles.status', 'active'),
  ]);
  if (workflowRoleStepsResult.error) throw new Error(workflowRoleStepsResult.error.message);
  if (activeUserRolesResult.error) throw new Error(activeUserRolesResult.error.message);

  const workflowRoleIds = new Set<string>();
  for (const step of workflowRoleStepsResult.data ?? []) {
    if (step.role_id) workflowRoleIds.add(step.role_id);
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
  };
}
