// Regla 3: 'use client' — los error boundaries de Next.js deben ser Client Components.
'use client';

import { AlertCircle } from 'lucide-react';

interface ErrorPanelProps {
  title: string;
  error: Error & { digest?: string };
  reset: () => void;
  wrapperClassName?: string;
}

export function ErrorPanel({ title, error, reset, wrapperClassName }: ErrorPanelProps) {
  return (
    <div className={`flex flex-col items-center gap-4 text-center${wrapperClassName ? ` ${wrapperClassName}` : ''}`}>
      <div className="w-10 h-10 rounded-full bg-danger-bg grid place-items-center">
        <AlertCircle size={20} className="text-danger" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-1 text-2xs text-muted">Ocurrió un error inesperado. Probá de nuevo y, si persiste, contactá a un administrador.</p>
        {error.digest && <p className="mt-1 text-2xs text-muted">Código: {error.digest}</p>}
      </div>
      <button
        onClick={reset}
        className="mt-2 px-4 py-2 text-2xs font-medium bg-primary text-primary-foreground rounded-md cursor-pointer"
      >
        Reintentar
      </button>
    </div>
  );
}
