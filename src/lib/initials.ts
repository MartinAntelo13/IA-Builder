// Iniciales para avatares: primera letra de las dos primeras palabras, en mayúsculas.
// Sin nombre usa la parte local del email; si tampoco hay, devuelve 'U'.
export function getInitials(fullName?: string | null, email?: string | null): string {
  const source = fullName?.trim() || email?.split('@')[0]?.trim() || '';
  const initials = source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
  return initials || 'U';
}
