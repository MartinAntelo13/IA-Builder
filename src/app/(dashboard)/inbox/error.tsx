'use client';
// Regla 3: 'use client' — los error boundaries de Next.js deben ser Client Components.

import { ErrorPanel } from '@/components/shared/error-panel';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function InboxError({ error, reset }: ErrorProps) {
  return (
    <ErrorPanel
      title="No se pudo cargar la bandeja de entrada"
      error={error}
      reset={reset}
      wrapperClassName="max-w-5xl mx-auto px-4 py-16"
    />
  );
}
