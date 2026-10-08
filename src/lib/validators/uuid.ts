// Patrón compartido para validar UUIDs recibidos del cliente.
// TODO: migrar las copias existentes de UUID_RE a este módulo:
//   - src/app/(dashboard)/team/actions.ts
//   - src/app/(dashboard)/workflows/actions.ts
//   - src/app/(dashboard)/workflows/page.tsx
//   - src/app/(dashboard)/requests/[id]/attachments/[attachmentId]/route.ts
export const UUID_RE = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;
