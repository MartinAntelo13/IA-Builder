// 'use client' - requires useEffect and useState to get local browser time
// (new Date() on server returns UTC, not local time)
'use client';

import { useEffect, useState } from 'react';
import { getTimeBasedGreeting, resolveDisplayName } from '@/lib/greeting';

interface GreetingProps {
  fullName: string | null;
  format?: 'first' | 'full';
  email?: string | null;
}

/**
 * Saludo del encabezado de Resumen - Client Component porque necesita la hora
 * LOCAL del navegador (new Date() en el servidor devolvería la hora UTC del server).
 *
 * El nombre viene siempre del usuario autenticado (nunca hardcodeado).
 * Antes de montar, el saludo se reserva con `invisible` para evitar parpadeo
 * y mismatch de hidratación.
 */
export function Greeting({ fullName, format = 'first', email }: GreetingProps) {
  const [greeting, setGreeting] = useState<string | null>(null);

  useEffect(() => {
    const updateGreeting = () => {
      setGreeting(getTimeBasedGreeting(new Date().getHours()));
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  const displayName = resolveDisplayName(fullName, format, email);

  return (
    <h1>
      <span className={greeting ? undefined : 'invisible'}>
        {greeting ?? 'Buenos días'},
      </span>{' '}
      <span>{displayName}</span>
      <span className="hero-dash" aria-hidden="true">
        —
      </span>
    </h1>
  );
}
