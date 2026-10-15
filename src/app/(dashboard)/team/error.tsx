'use client';
// Regla 3: 'use client' — los error boundaries de Next.js deben ser Client Components.

import { ErrorPanel } from '@/components/shared/error-panel';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function TeamError({ error, reset }: ErrorProps) {
  return (
    <ErrorPanel
      title="No se pudo cargar el equipo"
      error={error}
      reset={reset}
      wrapperClassName="max-w-6xl mx-auto px-10 pt-16 pb-16"
    />
  );
}
