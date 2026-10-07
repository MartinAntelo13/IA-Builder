'use client';
// Regla 3: 'use client' — useRouter para navegar en el onChange del select de rol.

import { useRouter } from 'next/navigation';
import Form from 'next/form';
import { Search } from 'lucide-react';
import { ROUTES } from '@/constants';
import type { RoleCatalog } from '@/lib/transformers/team';

interface TeamFiltersProps {
  roles: RoleCatalog[];
  q: string;
  role: string;
}

export function TeamFilters({ roles, q, role }: TeamFiltersProps) {
  const router = useRouter();

  function handleRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value;
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (newRole) p.set('role', newRole);
    router.push(`${ROUTES.TEAM}?${p.toString()}`);
  }

  return (
    <div className="flex items-center gap-3 max-sm:flex-col max-sm:items-stretch">
      <Form action={ROUTES.TEAM} className="relative flex-1 min-w-0">
        {role && <input type="hidden" name="role" value={role} />}
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
        />
        <input
          name="q"
          type="search"
          defaultValue={q}
          maxLength={100}
          placeholder="Buscar miembro..."
          className="w-full h-8 pl-8 pr-3 text-2xs border border-border rounded-md outline-none focus:border-primary bg-white text-foreground placeholder:text-muted"
        />
      </Form>

      <select
        value={role}
        onChange={handleRoleChange}
        aria-label="Filtrar por rol"
        className="h-8 pl-3 pr-7 text-2xs border border-border rounded-md outline-none focus:border-primary bg-white text-foreground appearance-none cursor-pointer shrink-0"
      >
        <option value="">Todos los roles</option>
        {roles.map((r) => (
          <option key={r.id} value={r.code}>
            {r.name}
          </option>
        ))}
      </select>
    </div>
  );
}
