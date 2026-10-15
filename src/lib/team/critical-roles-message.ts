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

// Referencia a un paso de workflow usada para armar los avisos de deshabilitación.
export type WorkflowStepRef = { workflowName: string; stepLabel: string };

// Formatea los pasos como `"label" (workflow "name")`, separados por ", ";
// corta en 3 y agrega ` y N más` cuando hay sobrantes.
function formatStepRefs(steps: readonly WorkflowStepRef[]): string {
  const items = steps.slice(0, 3).map((s) => `"${s.stepLabel}" (workflow "${s.workflowName}")`);
  const base = items.join(', ');
  const rest = steps.length - 3;
  return rest > 0 ? `${base} y ${rest} más` : base;
}

export function buildAssignedStepsMessage(steps: readonly WorkflowStepRef[]): string {
  const items = formatStepRefs(steps);
  if (steps.length === 1) {
    return `Es la persona asignada como aprobadora del paso ${items}: las solicitudes nuevas de ese workflow no podrán enviarse hasta cambiar el aprobador del paso, y las que estén en curso no podrán avanzar mientras esta persona esté deshabilitada.`;
  }
  return `Es la persona asignada como aprobadora de los pasos ${items}: las solicitudes nuevas de esos workflows no podrán enviarse hasta cambiar el aprobador de esos pasos, y las que estén en curso no podrán avanzar mientras esta persona esté deshabilitada.`;
}

export function buildManagerImpactMessage(
  reportsCount: number,
  steps: readonly WorkflowStepRef[],
): string {
  const items = formatStepRefs(steps);
  const singular = reportsCount === 1;
  const subject = singular ? '1 persona activa tiene' : `${reportsCount} personas activas tienen`;
  const whose = singular ? 'esa persona' : 'esas personas';
  const theirManager = singular ? 'su responsable' : 'el responsable de cada una';
  return `${subject} a esta persona como responsable y hay workflows activos con un paso de aprobación del responsable, ${items}: las solicitudes nuevas de ${whose} en esos workflows no podrán enviarse hasta cambiar ${theirManager}, y las que estén en curso no podrán avanzar mientras esta persona esté deshabilitada.`;
}
