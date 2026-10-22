// Regla 3: 'use client' — Form de búsqueda en desktop; botón + overlay de búsqueda en móvil.
'use client';

import { useId, useRef, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Form from 'next/form';
import { Search, X } from 'lucide-react';
import { ROUTES } from '@/constants';

export function TopbarSearch() {
  const id = useId();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) { setPrevPathname(pathname); setOpen(false); }
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <>
      {/* Desktop: Form visible desde md */}
      <Form action={ROUTES.REQUESTS} className="relative hidden md:block w-56">
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          aria-hidden="true"
        />
        <input
          name="q"
          type="search"
          aria-label="Buscar en solicitudes"
          placeholder="Buscar en solicitudes..."
          className="w-full h-8 pl-8 pr-3 text-2xs border border-border rounded-md outline-none focus:border-primary bg-card text-foreground placeholder:text-muted"
        />
      </Form>

      {/* Móvil: botón lupa; el header sticky es el contexto de posicionamiento del overlay */}
      <button
        ref={buttonRef}
        type="button"
        aria-label="Buscar en solicitudes"
        aria-expanded={open}
        aria-controls={id}
        onClick={handleOpen}
        className="md:hidden text-muted transition-colors hover:text-foreground"
      >
        <Search className="h-4.5 w-4.5" aria-hidden="true" />
      </button>

      {/* Móvil: overlay de búsqueda que cubre el topbar */}
      {open && (
        <Form
          action={ROUTES.REQUESTS}
          role="search"
          id={id}
          onKeyDown={(e) => { if (e.key === 'Escape') handleClose(); }}
          className="md:hidden absolute inset-0 z-20 flex items-center gap-2 bg-card px-4"
        >
          <Search size={14} className="shrink-0 text-muted pointer-events-none" aria-hidden="true" />
          <input
            ref={inputRef}
            name="q"
            type="search"
            aria-label="Buscar en solicitudes"
            placeholder="Buscar en solicitudes..."
            className="flex-1 h-8 pl-3 pr-3 text-2xs border border-border rounded-md outline-none focus:border-primary bg-card text-foreground placeholder:text-muted"
          />
          <button
            type="button"
            aria-label="Cerrar búsqueda"
            onClick={handleClose}
            className="shrink-0 text-muted transition-colors hover:text-foreground"
          >
            <X className="h-4.5 w-4.5" aria-hidden="true" />
          </button>
        </Form>
      )}
    </>
  );
}
