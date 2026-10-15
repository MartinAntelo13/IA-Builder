import type { CriticalRolesMode } from '@/lib/team/critical-roles-message';

type MemberStatus = 'active' | 'invited' | 'disabled';
type RoleCodeName = { code: string; name: string };
export type CriticalRolesWarningState =
  | { names: readonly string[]; mode: CriticalRolesMode }
  | null;

// Devuelve los NOMBRES de los roles del usuario que, al deshabilitarlo,
// dejarían a algún workflow sin ninguna persona activa que los cubra:
//   - el rol se usa en al menos un paso de workflow activo (está en workflowRoleIds)
//   - el único activo que lo tiene es este mismo usuario
//     (users.length === 1 && users[0] === userId — NO comparamos arrays con ===).
// Si el usuario no está activo, no hay nada que advertir: devolvemos [].
// Pura: sin side-effects, sin Date.now, segura para Server Components.
export function computeCriticalRoleNames(
  userId: string,
  userStatus: MemberStatus,
  userRoleIds: readonly string[],
  workflowRoleIds: ReadonlySet<string>,
  activeUsersByRole: ReadonlyMap<string, readonly string[]>,
  rolesById: ReadonlyMap<string, string>,
): string[] {
  if (userStatus !== 'active') return [];
  const names: string[] = [];
  for (const roleId of userRoleIds) {
    if (!workflowRoleIds.has(roleId)) continue;
    const users = activeUsersByRole.get(roleId) ?? [];
    if (users.length === 1 && users[0] === userId) {
      const name = rolesById.get(roleId);
      if (name) names.push(name);
    }
  }
  return names;
}

// De los roles críticos (nombres), devuelve los que corresponden a códigos
// que ya NO están en la selección actual del formulario (es decir, los
// roles críticos que el usuario está por quitarle al miembro).
export function removedCriticalRoleNames(
  criticalRoleNames: readonly string[],
  roles: readonly RoleCodeName[],
  selectedRoleCodes: readonly string[],
): string[] {
  if (criticalRoleNames.length === 0) return [];
  const criticalSet = new Set(criticalRoleNames);
  const selectedSet = new Set(selectedRoleCodes);
  return roles
    .filter((r) => criticalSet.has(r.name) && !selectedSet.has(r.code))
    .map((r) => r.name);
}

// Para el formulario de edición: decide qué advertencia mostrar (si corresponde).
// Prioriza 'disable' cuando el miembro activo se está deshabilitando y tiene
// roles críticos; si no, verifica si se le están quitando roles críticos.
export function computeEditWarning(
  criticalRoleNames: readonly string[],
  memberStatus: MemberStatus,
  roles: readonly RoleCodeName[],
  selectedRoleCodes: readonly string[],
  selectedStatus: MemberStatus,
): CriticalRolesWarningState {
  if (
    selectedStatus === 'disabled' &&
    memberStatus === 'active' &&
    criticalRoleNames.length > 0
  ) {
    return { names: criticalRoleNames, mode: 'disable' };
  }
  const removed = removedCriticalRoleNames(criticalRoleNames, roles, selectedRoleCodes);
  if (removed.length > 0) return { names: removed, mode: 'removeRole' };
  return null;
}
