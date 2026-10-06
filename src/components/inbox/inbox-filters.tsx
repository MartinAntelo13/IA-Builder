'use client';
// Regla 3: 'use client' por el <select> de ordenación que usa onChange para
// navegar con router.push, y useSearchParams para construir la URL preservando params.

import { useRouter } from 'next/navigation';
import Form from 'next/form';
import { Search } from 'lucide-react';
import { ROUTES } from '@/constants';

interface InboxFiltersProps {
  tab: string;
  sort: string;
  q: string;
}

export function InboxFilters({ tab, sort, q }: InboxFiltersProps) {
  const router = useRouter();

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newSort = e.target.value;
    const p = new URLSearchParams();
    p.set('tab', tab);
    if (newSort !== 'newest') p.set('sort', newSort);
    if (q) p.set('q', q);
    router.push(`${ROUTES.INBOX}?${p.toString()}`);
  }

  return (
    <div className="flex items-center gap-3 max-md:flex-col max-md:items-stretch">
      <Form action={ROUTES.INBOX} className="relative flex-1 min-w-0">
        <input type="hidden" name="tab" value={tab} />
        {sort !== 'newest' && <input type="hidden" name="sort" value={sort} />}
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
        />
        <input
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Buscar por título, solicitante o ID..."
          className="w-full h-8 pl-8 pr-3 text-2xs border border-border rounded-md outline-none focus:border-primary bg-white text-foreground placeholder:text-muted"
        />
      </Form>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-2xs text-muted whitespace-nowrap">Ordenar por</span>
        <select
          value={sort}
          onChange={handleSortChange}
          className="h-8 pl-3 pr-7 text-2xs border border-border rounded-md outline-none focus:border-primary bg-white text-foreground appearance-none cursor-pointer"
        >
          <option value="newest">Más recientes</option>
          <option value="amount_desc">Mayor monto</option>
        </select>
      </div>
    </div>
  );
}
