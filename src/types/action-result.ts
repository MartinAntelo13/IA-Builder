// Resultado unificado para Server Actions. Fase 7 Parte 3: usado por
// team/actions.ts. No se refactorizan las otras actions (workflows/actions.ts,
// requests/[id]/actions.ts) para no cambiar el scope — queda como deuda anotada.
export type ActionResult<T = void> = T extends void
  ? { ok: true } | { ok: false; error: string }
  : ({ ok: true } & T) | { ok: false; error: string };
