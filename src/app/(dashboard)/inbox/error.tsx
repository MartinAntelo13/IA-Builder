'use client';
// Next.js requires error boundaries to be Client Components

import { AlertCircle } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function InboxError({ error, reset }: ErrorProps) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 flex flex-col items-center gap-4 text-center">
      <div className="w-10 h-10 rounded-full bg-danger-bg grid place-items-center">
        <AlertCircle size={20} className="text-danger" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">No se pudo cargar la bandeja de entrada</p>
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
