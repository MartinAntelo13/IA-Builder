'use client';
// Regla 3: 'use client' — <Form> de next/form con submit al presionar Enter.
// No se incluye `page` como input oculto para que la búsqueda resetee a la página 1.

import Form from 'next/form';
import { Search } from 'lucide-react';
import { ROUTES } from '@/constants';

interface RequestsSearchProps {
  q: string;
  scope?: 'all';
}

export function RequestsSearch({ q, scope }: RequestsSearchProps) {
  return (
    <Form action={ROUTES.REQUESTS} className="relative flex-1 min-w-0">
      {scope === 'all' && <input type="hidden" name="scope" value="all" />}
      <Search
        size={14}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
      />
      <input
        name="q"
        type="search"
        defaultValue={q}
        maxLength={100}
        placeholder="Buscar por título, solicitante o ID..."
        className="w-full h-8 pl-8 pr-3 text-2xs border border-border rounded-md outline-none focus:border-primary bg-card text-foreground placeholder:text-muted"
      />
    </Form>
  );
}
