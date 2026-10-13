import { ROLE_PRIORITY } from '@/constants';

type Role = { code: string; name: string };

// Orden determinístico de roles: primero los codes conocidos (admin, approver,
// finance, management) en el orden declarado por ROLE_PRIORITY; luego los
// desconocidos en el orden original (sort estable). Devuelve el principal y el
// resto para que el consumidor arme "Nombre +N" sin preocuparse por el orden
// con que la base devolvió los roles.
export function orderRoles(roles: Role[]): { principal: Role | null; rest: Role[] } {
  const indexOf = (code: string): number => {
    const idx = (ROLE_PRIORITY as readonly string[]).indexOf(code);
    return idx === -1 ? ROLE_PRIORITY.length : idx;
  };
  const ordered = [...roles].sort((a, b) => indexOf(a.code) - indexOf(b.code));
  const [principal = null, ...rest] = ordered;
  return { principal, rest };
}
