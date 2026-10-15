'use client';
// Regla 3: 'use client' — error boundary para rutas hijo sin error.tsx propio.

import { ErrorPanel } from '@/components/shared/error-panel';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  return (
    <ErrorPanel
      title="No se pudo cargar la página"
      error={error}
      reset={reset}
      wrapperClassName="max-w-6xl mx-auto px-10 pt-16 pb-16 max-md:px-4"
    />
  );
}
