// Mensaje de advertencia para los roles críticos de un miembro.
// 'disable'  → al deshabilitar al miembro.
// 'removeRole' → al quitarle el/los rol(es) crítico(s) desde el formulario de edición.
// Puro: sin side-effects; seguro en Server Components.
export type CriticalRolesMode = 'disable' | 'removeRole';

export function buildCriticalRolesMessage(
  names: readonly string[],
  mode: CriticalRolesMode,
): string {
  const quoted = names.map((n) => `"${n}"`);
  const isPlural = quoted.length > 1;
  const rolesText = isPlural
    ? `con los roles ${quoted.join(', ')}`
    : `con el rol ${quoted[0]}`;
  const consequence = mode === 'removeRole'
    ? ` si se ${isPlural ? 'los' : 'lo'} quitás,`
    : '';
  return `Es la única persona activa ${rolesText}, que usan workflows:${consequence} las solicitudes nuevas de esos workflows no podrán enviarse y las que estén en curso no podrán avanzar hasta asignar otra persona.`;
}
