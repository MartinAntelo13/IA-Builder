// Clases Tailwind compartidas para formularios del dashboard.
// Centraliza la copia de la constante INPUT que estaba repetida en
// member-edit-dialog, invite-member-dialog, workflow-editor y workflow-step-card.
// TODO: migrar esas 4 copias a importar desde acá (fuera de scope de Fase 8).
export const INPUT =
  'w-full px-3 py-2 rounded-md border border-border bg-white text-xs text-foreground';

// Variante con padding derecho mayor para selects nativos con chevron a la derecha.
export const SELECT_WITH_CHEVRON = `${INPUT} appearance-none pr-9 cursor-pointer`;

// Base de botones del footer de dialogs (primary / secondary).
export const BTN_BASE =
  'inline-flex items-center justify-center gap-2 min-h-10 px-4 rounded-md text-xs font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed';
export const BTN_PRIMARY = `${BTN_BASE} bg-primary text-primary-foreground hover:bg-primary/90`;
export const BTN_SECONDARY = `${BTN_BASE} border border-border text-muted bg-white hover:bg-surface`;
export const BTN_DANGER = `${BTN_BASE} bg-danger text-white hover:bg-danger/90`;
