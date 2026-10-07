'use client';
// Next.js requires error boundaries to be Client Components

import { AlertCircle } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function TeamError({ error, reset }: ErrorProps) {
  return (
    <div className="max-w-6xl mx-auto px-10 pt-16 pb-16 flex flex-col items-center gap-4 text-center">
      <div className="w-10 h-10 rounded-full bg-danger-bg grid place-items-center">
        <AlertCircle size={20} className="text-danger" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">No se pudo cargar el equipo</p>
        <p className="mt-1 text-2xs text-muted">{error.message}</p>
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
