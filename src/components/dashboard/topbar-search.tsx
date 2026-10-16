// Regla 3: 'use client' — <Form> de next/form con submit a /requests y <Link>.
'use client';

import Form from 'next/form';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { ROUTES } from '@/constants';

export function TopbarSearch() {
  return (
    <>
      <Form action={ROUTES.REQUESTS} className="relative hidden md:block w-56">
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          aria-hidden="true"
        />
        <input
          name="q"
          type="search"
          aria-label="Buscar solicitudes"
          placeholder="Buscar solicitudes..."
          className="w-full h-8 pl-8 pr-3 text-2xs border border-border rounded-md outline-none focus:border-primary bg-card text-foreground placeholder:text-muted"
        />
      </Form>
      <Link
        href={ROUTES.REQUESTS}
        aria-label="Buscar solicitudes"
        className="md:hidden text-muted transition-colors hover:text-foreground"
      >
        <Search className="h-4.5 w-4.5" aria-hidden="true" />
      </Link>
    </>
  );
}
