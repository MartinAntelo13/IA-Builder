type MemberStatus = 'active' | 'invited' | 'disabled';

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
